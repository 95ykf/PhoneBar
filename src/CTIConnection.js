import utils from "./utils/utils";
import {MessageID, DeviceState} from "./constants";
import Ajax from "./utils/Ajax";
import AgentApi from "./AgentApi";
import Log from "./utils/Log";
import WebSocketBaseClient from "./WebSocketBaseClient";
import Agent from "./model/Agent";

/**
 * 基于jWebSocket js库实现与话务平台的websocket通信
 * 定义了与消息服务器建立链接、关闭、监听消息（详细见文件中注释部分）.
 * WEB端请求的事件都在此向消息服务器请求，消息服务器返回和推送的事件也在这里处理。
 * @extends WebSocketBaseClient
 */
class CTIConnection extends WebSocketBaseClient {

    /**
     *
     * @param wsUrl {String}  websocket地址
     * @param agent {Agent}
     * @param agentConfig {AgentConfig}
     * @param linePool {LinePool}
     */
    constructor({
                    wsUrl = 'ws://127.0.0.1:8787/websocket',
                    agent,
                    agentConfig,
                    linePool,
                }) {
        super({'url':wsUrl, automaticOpen: false});

        this.agent = agent;
        this.linePool = linePool;
        this.agentConfig = agentConfig;
        this.agentApi = new AgentApi({
            agent: agent,
            agentConfig: agentConfig,
            linePool: linePool,
            connection: this,
        });

        this._loginTimeout = null;
        this.loggedIn = false;
    }

    login() {
        // 定义一个定时器，当接收到消息后清除此任务，如果在20秒内没有清除，将触发connectTimeout事件
        this._loginTimeout = window.setTimeout(() => {
            if (this.agentConfig.isPhoneTakeAlong === false) {
                utils.showMessage("网速过慢，软电话加载未成功，请刷新重试");
            }
        }, 20000);

        let data = this.loggedIn ? {
            "type": "ping",
            "thisDN": this.agent.thisDN,
            "agentID": this.agent.agentID,
            "messageId": ""
        } : {
            "messageId": 100,
            "thisDN": this.agent.thisDN,
            "agentID": this.agent.agentID,
            "thisQueues": this.agent.thisQueues,
            "defaultQueue": this.agent.defaultQueue,
        };

        this.sendMessage({
            type: "login",
            thisDN: this.agent.thisDN,
            agentID: this.agent.agentID,
            message: JSON.stringify(data)
        });
    }

    doClose() {
        if (this.isOpened()) {
            this.stopKeepAlive();
            this.close();
        }
    }

    send(data) {
        if (this.isOpened()) {
            let lToken = {
                thisDN: this.agent.thisDN,
                agentID: this.agent.agentID,
                type: "request",
                message: JSON.stringify(data)
            };
            Log.log(JSON.stringify(lToken), 'input');
            this.sendMessage(lToken);
            return true;
        } else {
            utils.showMessage("没有与CTI服务器建立连接！");
            return false;
        }
    }

    /**
     * 覆写父类方法，当startKeepAlive时会默认调用此方法
     */
    ping() {
        if(this.isOpened()) {
            this.sendMessage({
                type: "ping",
                thisDN: this.agent.thisDN,
                agentID: this.agent.agentID,
                message: ""
            });
        }
    }

    onClose(event) {
        this.stopKeepAlive();
    }

    onOpen(event) {
        this.startKeepAlive(false);
        //登录成功，且不在通话中，自动置闲(服务器响应为5S)
        if (this.agentConfig.autoIdleWhenLogin) {
            window.setTimeout(() => {
                if (this.isOpened() && this.loggedIn &&
                    DeviceState.REGISTERED === this.agent.deviceState &&
                    Agent.BUSY === this.agent.state) {
                    this.agentApi.agentReady();
                }
            }, 5000);
        }

        this.sendMessage({
            type:"welcome",
            thisDN:"",
            agentID: "",
            message:""
        });
    }

    /**
     * 协议消息转换
     * @param event  event.data是服务器返回数据，其中messageId代表消息类型与常量MessageID对应。
     *               坐席相关事件中event.data.deviceState与常量DeviceState对应。
     *
     */
    onMessage(event) {
        let data = JSON.parse(event.data);
        if (data == null) return;
        if (data.messageId !== MessageID.EventWelcome && data.messageId !== MessageID.EventPong) Log.log(JSON.stringify(data), 'output');
        // CTI握手成功
        if (data.messageId === MessageID.EventWelcome) {
            this.login();
        }
        if (data.messageId === MessageID.EventAgentLogin) {
            window.clearTimeout(this._loginTimeout);
            this.loggedIn = true;
        }
        if(!this.loggedIn && data.messageId === MessageID.EventAgentReady){
            this.agentApi.agentLogout();
            utils.showMessage("异常就绪,已自动请求登出！");
            return;
        }

        this.emit(data.messageId.toString(), data);

        if (data.messageId === MessageID.EventAgentLogin ||
            data.messageId === MessageID.EventAgentNotReady ||
            data.messageId === MessageID.EventAgentReady) {
            // 不处理通话和振铃事件，由LinePool监控这两种状态；其他状态当存在通话时收到通知不处理；
            if (data.reasonCode !== 1 && data.reasonCode !== 6 && this.linePool.getWorkingLineCount() === 0) {
                this.agent.setAgentState(Agent.convertToLocalState(data.state, data.reasonCode));
            }
            this.agent.setDeviceState(data.deviceState);
        } else if (data.messageId === MessageID.EventAgentLogout) {
            this.agent.setAgentState(Agent.convertToLocalState(data.state, data.reasonCode));
            this.agent.setDeviceState(data.deviceState);
            this.loggedIn = false;
            Ajax.send({
                url: '/application/is_pta/' + data.thisDN,
                type: 'get',
            });
        } else if (data.messageId === MessageID.EventDialing ||
            data.messageId === MessageID.EventRinging ||
            data.messageId === MessageID.EventEstablished ||
            data.messageId === MessageID.EventReleased ||
            data.messageId === MessageID.EventHeld ||
            data.messageId === MessageID.EventRetrieved ||
            data.messageId === MessageID.EventAbandoned) {
            this.linePool.updateLineDate(data);
        } else if (data.messageId === MessageID.EventError) {
            utils.showMessage(data.errorMessage);
        } else if (data.messageId === MessageID.EventLinkDisconnected && data.reason === 1) {
            if (data.reason === 1) {
                utils.showMessage("该坐席已经从其它地方登入，请退出!");
                setTimeout(() => {this.emit('linkDisconnected')}, 3000);
            } else {
                utils.showMessage("与服务器的连接已断开!");
            }
        }
    }

}

export default CTIConnection;
