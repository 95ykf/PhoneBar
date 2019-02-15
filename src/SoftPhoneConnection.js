import EventEmitter from 'eventemitter3';
import utils from "./utils/utils";

/**
 * 内置软电话交互JS
 */
class SoftPhoneConnection extends EventEmitter {

    constructor({
                    urls = ['ws://127.0.0.1:57712', "ws://127.0.0.1:58823"], protocols = [],

                    serverUrl, username, password,

                    automaticOpen = false,
                    pingInterval = 20000
                } = {}) {
        super();
        this.wsInfo = urls.map(function (v, i) {
            return {'ws': null, 'url': v, 'enabled': true};
        });
        this.protocols = protocols;

        this.serverUrl = serverUrl;
        this.username = username;
        this.password = password;

        /** 实例化后是否自动打开 */
        this.automaticOpen = automaticOpen;
        /** ping时间间隔 */
        this.pingInterval = pingInterval;

        this.currentWS = null;
        this.sessionid = null;
        this.pingcount = 0;
        this.pingTimeHandler = null;

        if (this.automaticOpen) {
            this.open();
        }
    }

    /**
     * 获取第一个可用的wsInfo，如果无可用URL返回null
     *
     * @returns {*}
     */
    getFirstEnabledWSInfo() {
        for (let i = 0, len = this.wsInfo.length; i < len; i++) {
            if (this.wsInfo[i].enabled) {
                return this.wsInfo[i];
            }
        }
        return null;
    }

    /**
     * 获取url地址相同的wsInfo，如果无匹配结果返回null
     *
     * @returns {*}
     */
    getWSInfoByPath(path) {
        for (let i = 0, len = this.wsInfo.length; i < len; i++) {
            if (path.indexOf(this.wsInfo[i].url) > -1) {
                return this.wsInfo[i];
            }
        }
        return null;
    }

    /**
     * 初始化
     */
    open() {
        let wsInfo = this.getFirstEnabledWSInfo();
        // 如果没有可用url，弹出提示并不在创建连接
        if (null == wsInfo) {
            utils.showMessage('内置话机异常,请检查本地服务是否被禁用，或重新安装软电话！');
            return false;
        }
        this.currentWS = null;
        this.currentWS = new WebSocket(wsInfo.url, this.protocols);
        this.currentWS.onopen = (aEvent) => {
            this.onOpen(aEvent, wsInfo)
        };
        this.currentWS.onclose = (aEvent) => {
            this.onDisconnected(aEvent, wsInfo)
        };
        this.currentWS.onmessage = (aEvent) => {
            this.onMessage(aEvent, wsInfo)
        };
        this.currentWS.onerror = (aEvent) => {
            this.onError(aEvent, wsInfo)
        };

        wsInfo.ws = this.currentWS;

        return this;
    }

    onOpen(aEvent) {
        console.log(aEvent, 'sipphone onConnect', this.getFirstEnabledWSInfo());
        this.doLogin(this.serverUrl, this.username, this.password);
    }

    onDisconnected(aEvent, wsInfo) {
        console.log('sipphone closed');
        this.stopPing();
        wsInfo.ws = null;
    }

    onMessage(message) {
        let token = JSON.parse(message.data);
        if (token.action === 'ping') {
            this.pingcount = 0;
        } else if (token.action === 'login') {
            if (this.username === token.data.user && token.data.result === 1) {
                this.sessionid = token.data.sid;
                this.startPing();
                this.emit('loginSuccess', token);
            } else {
                utils.showMessage("软电话注册失败！");
            }
        } else if (token.action === "close" && token.data.user === this.username) {
            this.stopPing();
            utils.showMessage('软电话已退出！');
        }
        this.emit(token.action, token.data);
    }

    onError(aEvent) {
        let wsInfo = this.getWSInfoByPath(aEvent.currentTarget.url);
        wsInfo.enabled = false;
        // 重试
        this.open();
    }

    isOpened() {
        return this.currentWS && this.currentWS.readyState === WebSocket.OPEN;
    }

    doClose() {
        if (this.isOpened()) {
            this.send({
                "action" : "close",
                "sid": this.sessionid,
                "data" : {"user" : this.username}
            });
            this.currentWS.close();
        }
    }

    send(msg) {
        if (this.isOpened()) {
            this.sessionid || (msg['sid'] = this.sessionid);
            return this.currentWS.send(JSON.stringify(msg));
        } else {
            throw 'INVALID_STATE_ERR : Pausing to reconnect websocket';
        }
    }

    doLogin(addr, username, password) {
        if (this.isOpened()) {
            this.send({
                'action': 'login',
                'data': {'addr': addr, 'user': username, 'password': password}
            });
        } else {
            this.open();
        }
    }

    /**
     * 发送ping消息
     */
    sendPing() {
        this.send({
            'action': 'ping',
            'sid': this.sessionid
        });
        this.pingcount = this.pingcount + 1;
        if (this.pingcount > 3) {
            this.stopPing();
            console.log('reLoad');
            this.open();
        }
    }

    /**
     * 开始ping
     */
    startPing() {
        this.pingTimeHandler = setTimeout(() => {
            this.startPing()
        }, this.pingInterval);
        this.sendPing()
    }

    /**
     * 结束ping
     */
    stopPing() {
        clearTimeout(this.pingTimeHandler);
        this.pingcount = 0;
    }
}


export default SoftPhoneConnection;
