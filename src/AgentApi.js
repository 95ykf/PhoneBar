import utils from "./utils/utils";
import {DeviceState, LineState, CallType, MessageID} from "./constants";
import Agent from "./model/Agent";

/**
 * 坐席与CTI的操作API
 */
class AgentApi {

    /**
     * @param agent {Agent} 坐席信息
     * @param agentConfig {AgentConfig} 坐席配置信息
     * @param linePool {LinePool} 线路信息
     * @param connection {CTIConnection} 服务器连接
     */
    constructor({agent, agentConfig, linePool, connection}) {
        this.agent = agent;
        this.agentConfig = agentConfig;
        this.linePool = linePool;
        this.connection = connection;
    }

    /**
     * 取消订阅
     */
    unsubscribe() {
        let data = {"messageId": 263, "thisDN": this.agent.thisDN};
        this.connection.send(data);
    }

    /**
     * 坐席登录
     */
    agentLogin() {
        if (this.agentConfig.isPhoneTakeAlong) return;
        let data = {
            "messageId": 100,
            "thisDN": this.agent.thisDN,
            "agentID": this.agent.agentID,
            "thisQueues": this.agent.thisQueues
        };
        this.connection.send(data);
    }

    /**
     * 坐席退出
     */
    agentLogout() {
        if (this.agentConfig.isPhoneTakeAlong) return;
        let data = {"messageId": 103, "thisDN": this.agent.thisDN, "agentID": this.agent.agentID};
        this.connection.send(data);
    }

    /**
     * 坐席修改状态为非就绪状态
     *
     * @param reasonCode 非就绪原因码 NotReadyReason
     */
    agentNotReady(reasonCode) {
        if (this.agentConfig.isPhoneTakeAlong || reasonCode === 1 || reasonCode === 6) return;
        if (this.agent.state === Agent.OFFLINE) {
            utils.showMessage('未登入，不能切换状态');
            return;
        }
        let data = {
            "messageId": 102,
            "thisDN": this.agent.thisDN,
            "agentID": this.agent.agentID,
            "reasonCode": reasonCode,
        };
        this.connection.send(data);
    }

    /**
     * 坐席设置为就绪状态
     */
    agentReady() {
        if (this.agentConfig.isPhoneTakeAlong) return;
        if (this.agent.state === Agent.OFFLINE) {
            utils.showMessage('未登入，不能切换状态');
            return;
        }
        let data = {
            "messageId": 101,
            "thisDN": this.agent.thisDN,
            "agentID": this.agent.agentID,
        };
        this.connection.send(data);
    }

    /**
     * 手动拨号
     * @param dest
     * @param id
     * @param type 呼叫类型，参考CALLTYPE常量
     * @param module  手动回拨
     * @param call_id  原电话 callId
     * @param queue
     * @param newTransPara
     * @param taskId
     * @param numberId
     * @returns {boolean}
     */
    makeCall(dest, id, type, module, call_id, queue, newTransPara, taskId, numberId) {
        if (!dest) {
            utils.showMessage("号码不能为空");
            return false;
        }
        if (dest.length === 9 && dest.charAt(0) === '1' && dest.indexOf(this.agent.tid) !== 0) {
            utils.showMessage("号码不符合规范");
            return false;
        }
        if (this.agent.deviceState === DeviceState.UNREGISTERED) {
            utils.showMessage("请登陆SIP话机，并刷新坐席状态");
            return false;
        }
        if (this.agentConfig.isPhoneTakeAlong) {
            utils.showMessage("手机随行下，不能在页面拨打电话");
            return false;
        }
        if (this.agent.state === Agent.OFFLINE) {
            utils.showMessage("当前为登出状态，请先登入");
            return false;
        }
        if (this.agent.state === Agent.READY) {
            this.agentNotReady(1);
        }
        if (this.linePool.getWorkingLineCount() !== 0) {
            utils.showMessage("当前已在通话中！");
            return false;
        }

        if (utils.checkPhoneNumber(dest)) {
            dest = utils.trim(dest);
            let data = {
                "messageId": 200, "thisDN": this.agent.thisDN, "agentID": this.agent.agentID, "otherDN": dest,
                "attachDatas": {"id": id, "type": type, "cti-agentID": this.agent.agentID}
            };
            if (queue) data["thisQueue"] = queue;
            if (this.agent.pstnDN) data["pbxParams"] = {"dnis": this.agent.pstnDN};
            if (module) data["attachDatas"]["module"] = module;
            if (call_id) data["attachDatas"]["member_uuid"] = call_id;
            if (queue) data["attachDatas"]["ocb_queue"] = queue;
            if (newTransPara) data["attachDatas"]["trans_para"] = newTransPara;
            if (taskId) data["attachDatas"]["task_id"] = taskId;
            if (numberId) data["attachDatas"]["numberId"] = numberId;
            return this.connection.send(data);
        } else {
            return false;
        }
    }

    /**
     * 接听电话
     */
    answerCall() {
        let line = this.linePool.getCurrentLine();
        if (line.lineState !== LineState.RINGING && line.lineState !== LineState.DIALING) {
            utils.showMessage("没有可接听的电话！");
            return false;
        } else {
            let data = {
                "messageId": 201,
                "thisDN": this.agent.thisDN,
                "agentID": this.agent.agentID,
                "callID": line.callId
            };
            this.connection.send(data);
        }
    }

    /**
     * 保持呼叫
     */
    holdCall() {
        let line = this.linePool.getCurrentLine();
        if (line.lineState !== LineState.TALKING) {
            utils.showMessage("当前不在通话中，无法保持通话");
        } else {
            let data = {
                "messageId": 204,
                "thisDN": this.agent.thisDN,
                "agentID": this.agent.agentID,
                "callID": line.callId
            };
            this.connection.send(data);
        }
    }

    /**
     * 接回保持的呼叫
     * @returns {boolean}
     */
    retrieveCall() {
        let line = this.linePool.getCurrentLine();
        if (line.lineState !== LineState.HELD) {
            utils.showMessage("当前线路非保持状态，无需接回");
            return false;
        }
        // 接回保持的通话前结束掉其他线路通话
        this.linePool.lines.forEach((otherLine) => {
            if (otherLine.id !== line.id && otherLine.lineState !== LineState.IDLE) {
                this.releaseCall(otherLine.id);
            }
        });

        this.connection.send({
            "messageId": 217,
            "thisDN": this.agent.thisDN,
            "agentID": this.agent.agentID,
            "callID": line.callId
        });
    }

    /**
     * 挂断电话
     * @param lineId 要挂断的线路ID
     * @returns {boolean}
     */
    releaseCall(lineId) {
        if (typeof(lineId) === 'undefined' || lineId == null) {
            lineId = this.linePool.getCurrentLineId();
        }
        let line = this.linePool.getLine(lineId);
        if (null == line) {
            utils.showMessage("线路ID错误");
        } else if (line.lineState === LineState.IDLE) {
            utils.showMessage("当前线路没有电话,无需挂断");
        } else {
            return this.connection.send({
                "messageId": 203,
                "thisDN": this.agent.thisDN,
                "agentID": this.agent.agentID,
                "callID": line.callId
            });
        }
    }

    // cti.forceReleaseCall() {
    //     var lineId = cti.LinePool.getInstance().getTalkingLineId();
    //     checkLineId(lineId);
    //     var thisDN = cti.Agent.getInstance().getThisDN();
    //     var line = cti.LinePool.getInstance().getLine(lineId);
    //     var callId = line.callId;
    //     var callType = line.callType;
    //     var data = {"messageId":515,"thisDN":thisDN,"callID":callId,"callType":callType};
    //     cti.handleVoiceEvent(2, $.toJSON(data));
    // };
    // cti.redirectCall(lineId, targetDN) {
    //     checkLineId(lineId);
    //     if(checkPhoneNumber(targetDN)){
    //         targetDN = $.trim(targetDN);
    //         var thisDN = cti.Agent.getInstance().getThisDN();
    //         var line = cti.LinePool.getInstance().getLine(lineId);
    //         var callId = line.callId;
    //         var data = {"messageId":212,"thisDN":thisDN,"callID":callId,"otherDN":targetDN};
    //         cti.send(data);
    //     }
    // };

    /**
     * 两步转接-咨询
     * @param targetDN
     */
    consult(targetDN) {
        let line = this.linePool.getCurrentLine();
        if (line.lineState === LineState.TALKING &&
            (line.callType === CallType.INBOUND || line.callType === CallType.OUTBOUND ||
                line.callType === CallType.ORDERCALLBACK || line.callType === CallType.MANUALCALLBACK ||
                line.callType === CallType.PREDICT || line.callType === CallType.PREVIEW)) {
            if (utils.checkPhoneNumber(targetDN)) {
                let data = {
                    "messageId": 221,
                    "thisDN": this.agent.thisDN,
                    "agentID": this.agent.agentID,
                    "callID": line.callId,
                    "otherDN": targetDN,
                    "attachDatas": {"cti-agentID": this.agent.agentID}
                };
                this.connection.send(data);
            }
        } else if (line.callType !== CallType.INBOUND) {
            utils.showMessage("当前线路不是呼入，不能转接");
        } else {
            utils.showMessage("当前线路未在通话，不能转接");
        }
    }

    /**
     * 咨询后转出
     */
    completeTransfer() {
        let line = this.linePool.getCurrentLine();
        let consultLine = this.linePool.getConsultLine();
        if (line.lineState === LineState.HELD) {
            let data = {
                "messageId": 223,
                "thisDN": this.agent.thisDN,
                "agentID": this.agent.agentID,
                "callID": consultLine.callId,
                "consultCallID": line.callId
            };
            this.connection.send(data);
        }
    };

    /**
     * 呼叫转移
     * @param targetDN {String} 目标坐席工号或者外线号码
     */
    singleStepTransfer(targetDN) {
        let line = this.linePool.getCurrentLine();
        if (line.lineState === LineState.TALKING &&
            (line.callType === CallType.INBOUND || line.callType === CallType.OUTBOUND ||
                line.callType === CallType.ORDERCALLBACK || line.callType === CallType.MANUALCALLBACK ||
                line.callType === CallType.PREDICT || line.callType === CallType.PREVIEW)) {
            let phoneNumber = line.phoneNumber;
            if (utils.checkPhoneNumber(targetDN)) {
                let data = {
                    "messageId": 215,
                    "thisDN": this.agent.thisDN,
                    "agentID": this.agent.agentID,
                    "callID": line.callId,
                    "otherDN": targetDN,
                    "phoneNumber": phoneNumber
                };
                this.connection.send(data);
            }
        } else if (line.callType !== CallType.INBOUND) {
            utils.showMessage("当前线路不是呼入，不能转接")
        } else {
            utils.showMessage("当前线路未在通话中，不能转接")
        }

    }

    // cti.initiateConference(lineId, targetDN) {
    //     checkLineId(lineId);
    //     var thisDN = cti.Agent.getInstance().getThisDN();
    //     var line = cti.LinePool.getInstance().getLine(lineId);
    //     var agentID =  cti.Agent.getInstance().getAgentID();
    //     var callId = line.callId;
    //     var data = {"messageId":220,"thisDN":thisDN,"agentID":agentID,"callID":callId,"otherDN":targetDN};
    //     cti.send(data);
    // };
    // cti.completeConference() {
    //     var callId = "";//todo.
    //     var consultCallID = "";
    //     var agentID =  cti.Agent.getInstance().getAgentID();
    //     var data = {"messageId":222,"thisDN":thisDN,"agentID":agentID,"callID":callId,"consultCallID":consultCallID};
    //     cti.send(data);
    // };
    // cti.singleStepConference(lineId, targetDN) {
    //     checkLineId(lineId);
    //     if(checkPhoneNumber(targetDN)){
    //         targetDN = $.trim(targetDN);
    //         var thisDN = cti.Agent.getInstance().getThisDN();
    //         var agentID =  cti.Agent.getInstance().getAgentID();
    //         var line = cti.LinePool.getInstance().getLine(lineId);
    //         var callId = line.callId;
    //         var data = {"messageId":214,"thisDN":thisDN,"agentID":agentID,"callID":callId,"otherDN":targetDN};
    //         cti.send(data);
    //     }
    // };
    //

    /**
     * 三方通话
     * @param phoneNumber
     * @returns {boolean}
     */
    threeWayCall(phoneNumber) {
        let line = this.linePool.getCurrentLine();
        let thisExten = this.agent.thisDN.substring(5);

        if (phoneNumber.length > 12 || phoneNumber.length < 4 ||
            (phoneNumber.length === 9 && phoneNumber.charAt(0) === '1' && phoneNumber.indexOf(this.agent.tid) !== 0)) {
            utils.showMessage("号码不符合规范");
            return false;
        }
        if (phoneNumber.length === 4 && this.agent.tid !== '0') phoneNumber = this.agent.tid + phoneNumber;

        if (phoneNumber === line.phoneNumber) {
            utils.showMessage(`${phoneNumber}已经处于${thisExten}的会议中`);
        } else if (phoneNumber === thisExten) {
            utils.showMessage(`您已经处于${thisExten}的会议中`);
        } else if (line.lineState === LineState.TALKING && line.callType !== CallType.THREEWAY) {
            if (utils.checkPhoneNumber(phoneNumber)) {
                let data = {
                    "messageId": 225,
                    "thisDN": this.agent.thisDN,
                    "agentID": this.agent.agentID,
                    "callID": line.callId,
                    "otherDN": phoneNumber
                };
                this.connection.send(data);
            }
        } else if (line.callType === CallType.THREEWAY) {
            utils.showMessage(`您已经处于会议${line.phoneNumber}中`);
        } else {
            utils.showMessage("当前线路未在通话中，不能会议");
        }

    }

    /**
     * 结束三方通话
     * @param callId
     */
    releaseThreeWayCall(callId) {
        let data = {
            "messageId": 226,
            "thisDN": this.agent.thisDN,
            "agentID": this.agent.agentID,
            "callID": callId
        };
        this.connection.send(data);
    };

    /**
     * 发送DTMF
     *
     * @param lineId 要挂断的线路ID，当为空时取当前默认线路
     * @param digit 按键
     */
    sendDTMF(lineId, digit) {
        if (typeof(lineId) === 'undefined' || lineId == null) {
            lineId = this.linePool.getCurrentLineId();
        }
        let line = this.linePool.getLine(lineId);
        if (null == line) {
            utils.showMessage("线路ID错误");
        } else if (line.lineState === LineState.IDLE) {
            utils.showMessage("当前线路没有电话");
        } else {
            return this.connection.send({
                "messageId": 250,
                "thisDN": this.agent.thisDN,
                "callID": line.callId,
                "dtmfDigit":digit
            });
        }
    }

    // cti.updateUserData(lineId, userDataKeys, userDataValues) {
    //     checkLineId(lineId);
    //     var thisDN = cti.Agent.getInstance().getThisDN();
    //     var line = cti.LinePool.getInstance().getLine(lineId);
    //     var callId = line.callId;
    //     var userData = "";//todo.
    //     var data = {"messageId":232,"thisDN":thisDN,"callID":callId,"userData":userData};
    //     cti.send(data);
    // };
    // cti.deleteUserData(lineId, key) {
    //     checkLineId(lineId);
    //     var thisDN = cti.Agent.getInstance().getThisDN();
    //     var line = cti.LinePool.getInstance().getLine(lineId);
    //     var callId = line.callId;
    //     var data = {"messageId":231,"thisDN":thisDN,"callID":callId,"key":key};
    //     cti.send(data);
    // };
    // cti.getUserData() {
    //     //todo.
    // };

    startAgentsMonitoring(agentDNs){
        let data = {
            "messageId": 266,
            "thisDN": this.agent.thisDN,
            "agentID": this.agent.agentID,
            "agentDNS":agentDNs
        };
        this.connection.send(data);
    }
    stopAgentsMonitoring(agentDNs){
        let data = {
            "messageId": 267,
            "thisDN": this.agent.thisDN,
            "agentID": this.agent.agentID,
            "agentDNS":agentDNs
        };
        this.connection.send(data);
    }
    agentReadyM(agentID) {
        let data = {"messageId":101,"thisDN":this.agent.thisDN,"agentID":agentID};
        this.connection.send(data);
    }
    agentNotReadyM(agentID, reasonCode) {
        let data = {"messageId":102,"thisDN":this.agent.thisDN,"agentID":agentID,"reasonCode":reasonCode};
        this.connection.send(data);
    }
    agentLogoutM(agentID) {
        let data = {"messageId":103,"thisDN":this.agent.thisDN,"agentID":agentID};
        this.connection.send(data);
    }
    agentLoginM(agentID) {
        let data = {"messageId":100,"thisDN":this.agent.thisDN,"agentID":agentID};
        this.connection.send(data);
    }
    // cti.startOcbNumbersMonitoring(){
    //     var thisDN = cti.Agent.getInstance().getThisDN();
    //     var agentID =  cti.Agent.getInstance().getAgentID();
    //     var data = {"messageId":275,"thisDN":thisDN,"agentID":agentID};
    //     cti.send(data);
    // };
    // cti.stopOcbNumbersMonitoring(){
    //     var thisDN = cti.Agent.getInstance().getThisDN();
    //     var agentID =  cti.Agent.getInstance().getAgentID();
    //     var data = {"messageId":276,"thisDN":thisDN,"agentID":agentID};
    //     cti.send(data);
    // };
    //
    // cti.cancelOcbNumbers(nums){
    //     var thisDN = cti.Agent.getInstance().getThisDN();
    //     var agentID =  cti.Agent.getInstance().getAgentID();
    //     var data = {"messageId":277,"thisDN":thisDN,"agentID":agentID,"nums":nums};
    //     cti.send(data);
    // };
    // cti.digitCollections(ivr_id) {
    //     var lineId = cti.LinePool.getInstance().getCurrentLineId(),
    //         lineDt = cti.LinePool.getInstance().getLine(lineId),
    //         callId = lineDt.callId;
    //     if(callId==''){
    //         showMessage('当前线路不在通话中');
    //     }else{
    //         var thisDN = cti.Agent.getInstance().getThisDN(),
    //             agentID= cti.Agent.getInstance().getAgentID(),
    //             data   = {"messageId":227,"thisDN":thisDN,"agentID":agentID,"ivrID":ivr_id,"state":"begin","callID":callId};
    //         cti.send(data)
    //     }
    // };
    // cti.endCollections(ivr_id) {
    //     var lineId = cti.LinePool.getInstance().getCurrentLineId(),
    //         lineDt = cti.LinePool.getInstance().getLine(lineId),
    //         callId = lineDt.callId;
    //     if(callId==''){
    //         showMessage('当前线路不在通话中');
    //     }else{
    //         var thisDN = cti.Agent.getInstance().getThisDN(),
    //             agentID= cti.Agent.getInstance().getAgentID(),
    //             data   = {"messageId":227,"thisDN":thisDN,"agentID":agentID,"ivrID":ivr_id,"state":"end","callID":callId};
    //         cti.send(data)
    //     }
    // };

    /**
     * 监听
     * @param callId
     * @param targetDN
     */
    monitorCall(callId, targetDN) {
        let data = {
            "messageId": 265,
            "thisDN": this.agent.thisDN,
            "agentID": this.agent.agentID,
            "callID": callId,
            "otherDN":targetDN
        };
        this.connection.send(data);
    }

    /**
     * 强插
     * @param callId
     * @param targetDN
     */
    doInterruptCall(callId, targetDN) {
        let line = this.linePool.getCurrentLine();
        if (line.lineState !== LineState.IDLE) {
            utils.showMessage("当前状态不能强插,请先挂断电话！");
        } else {
            let data = {
                "messageId": 265,
                "thisDN": this.agent.thisDN,
                "agentID": this.agent.agentID,
                "callID": callId,
                "otherDN":targetDN,
                "whisper":"1"
            };
            this.connection.send(data);
        }
    }

    /**
     * 拦截
     * @param callId
     * @param targetDN
     * @param phoneNumber
     */
    substitute(callId, targetDN, phoneNumber) {
        let line = this.linePool.getCurrentLine();
        if (line.lineState !== LineState.IDLE) {
            utils.showMessage("当前状态不能拦截电话,请先挂断电话！");
        } else {
            let data = {
                "messageId": 215,
                "thisDN": targetDN,
                "agentID": this.agent.agentID,
                "otherDN":this.agent.thisDN,
                "callID": callId,
                "phoneNumber":phoneNumber
            };
            this.connection.send(data);
        }
    }

    /**
     * 挂断
     * @param callId
     * @param targetDN
     */
    releaseAgentCall(callId, targetDN) {
        let data = {
            "messageId": 203,
            "thisDN": targetDN,
            "agentID": this.agent.agentID,
            "callID": callId
        };
        this.connection.send(data);
    }
    // cti.startDialing(tenantID, outboundID, dialMode) {
    //     var agentID =  cti.Agent.getInstance().getAgentID();
    //     var thisDN = cti.Agent.getInstance().getThisDN();
    //     var data = {"messageId":1001,"agentID":agentID,"thisDN":thisDN,"tenantID":tenantID,"outboundID":outboundID,"dialMode":dialMode};
    //     cti.send(data);
    // };
    // cti.pauseDialing(tenantId, campaignId, dialMode) {
    //     var agentID =  cti.Agent.getInstance().getAgentID();
    //     var thisDN = cti.Agent.getInstance().getThisDN();
    //     var data = {"messageId":1002,"agentID":agentID,"thisDN":thisDN,"tenantID":tenantId,"outboundID":campaignId,"dialMode":dialMode};
    //     cti.send(data);
    // };
    // cti.stopDialing(tenantId, campaignId, dialMode) {
    //     var agentID =  cti.Agent.getInstance().getAgentID();
    //     var thisDN = cti.Agent.getInstance().getThisDN();
    //     var data = {"messageId":1003,"agentID":agentID,"thisDN":thisDN,"tenantID":tenantId,"outboundID":campaignId,"dialMode":dialMode};
    //     cti.send(data);
    // };
    // cti.updateCampaignRatio(tenantId,campaignId, ratio) {
    //     var agentID =  cti.Agent.getInstance().getAgentID();
    //     var thisDN = cti.Agent.getInstance().getThisDN();
    //     var data = {"messageId":1009,"agentID":agentID,"thisDN":thisDN,"tenantID":tenantId,"outboundID":campaignId,"ratio":ratio,"autoRatio":0};
    //     cti.send(data);
    // };
    // cti.playVoice =function(path) {
    //     var lineId = cti.LinePool.getInstance().getCurrentLineId();
    //     var line = cti.LinePool.getInstance().getLine(lineId);
    //     var thisDN = cti.Agent.getInstance().getThisDN();
    //     var data = {"messageId":301,"thisDN":thisDN,"uuid":line.callId, "filePath":path};
    //     cti.send(data);
    // };
    // cti.getStatisticAgent(reportType,startDate,endDate,agent_ids) {
    //     var thisDN = cti.Agent.getInstance().getThisDN();
    //     var agentID = cti.Agent.getInstance().getAgentID();
    //     var data = {
    //         'messageId':2000,
    //         'thisDN':thisDN,
    //         "agentID":agentID,
    //         'statisticMetric': {
    //             'filter': agent_ids,
    //             'statisticType': reportType,
    //             'timeRange': startDate,
    //             'timeRange2': endDate
    //         },
    //         'statisticObject': {
    //         }};
    //     cti.send(data);
    // };
    // cti.getStatisticMonth(reportType,month,agent_ids) {
    //     var thisDN = cti.Agent.getInstance().getThisDN();
    //     var agentID = cti.Agent.getInstance().getAgentID();
    //     var data = {
    //         'messageId':2002,
    //         'thisDN':thisDN,
    //         "agentID":agentID,
    //         'statisticMetric': {
    //             'filter': agent_ids,
    //             'statisticType': reportType,
    //             'timeRange': month,
    //             'timeRange2': month
    //         },
    //         'statisticObject': {
    //         }};
    //     cti.send(data);
    // };
    // cti.getStatisticForOutbound(startTime,endTime,filter,type) {
    //     var thisDN = cti.Agent.getInstance().getThisDN();
    //     var agentID = cti.Agent.getInstance().getAgentID();
    //     var data = {
    //         "messageId": 1011,
    //         "referenceID": 1000,
    //         "agentID":agentID,
    //         "statisticMetric": {
    //             "filter": filter,
    //             "statisticType": type,
    //             "timeProfile": "year",
    //             "timeRange": startTime,
    //             "timeRange2": endTime
    //         },
    //         "statisticObject": {
    //             "objectId": "kpi",
    //             "statisticObjectType": type,
    //             "tenantPassword": ""
    //         },
    //         "campaignId": 0,
    //         "thisDN": thisDN
    //     };
    //     cti.send(data);
    // };
    // cti.getStatisticHistoryDetail(reportType,startDate,endDate,filter,pageSize,currentPage) {
    //     var thisDN = cti.Agent.getInstance().getThisDN();
    //     var agentID = cti.Agent.getInstance().getAgentID();
    //     var data = {
    //         'messageId':2001,
    //         'thisDN':thisDN,
    //         'agentID':agentID,
    //         'statisticMetric': {
    //             'filter': filter,
    //             'statisticType': reportType,
    //             'timeRange': startDate,
    //             'timeRange2': endDate,
    //             'pageSize': pageSize,
    //             'currentPage': currentPage
    //         },
    //         'statisticObject': {
    //         }};
    //     cti.send(data);
    // };
    // cti.campaignLoadByFileName(campaignId,repeat) {
    //     var thisDN = cti.Agent.getInstance().getThisDN();
    //     var agentID = cti.Agent.getInstance().getAgentID();
    //     var data = {"messageId":1012,"thisDN":thisDN,"agentID":agentID,"campaignId":campaignId,"repeat":repeat};
    //     cti.send(data);
    // };
    // cti.campaignLoadByCId(cId,campaignId,repeat) {
    //     var thisDN = cti.Agent.getInstance().getThisDN();
    //     var agentID = cti.Agent.getInstance().getAgentID();
    //     var data = {"messageId":1018,"thisDN":thisDN,"agentID":agentID,"cId":cId,"campaignId":campaignId,"repeat":repeat};
    //     cti.send(data);
    // };
    // cti.retrieveCampaign(campaignId,retrieveCampaignId,retrieveType) {
    //     var thisDN = cti.Agent.getInstance().getThisDN();
    //     var agentID = cti.Agent.getInstance().getAgentID();
    //     var data = {"messageId":1013,"thisDN":thisDN,"agentID":agentID,"campaignId":campaignId,"retrieveCampaignId":retrieveCampaignId,"retrieveType":retrieveType};
    //     cti.send(data);
    // };
    // cti.getCallLoss(startDate,endDate,filter,pageSize,currentPage) {
    //     var thisDN = cti.Agent.getInstance().getThisDN();
    //     var agentID = cti.Agent.getInstance().getAgentID();
    //     var data = {
    //         'messageId':1015,
    //         'thisDN':thisDN,
    //         'agentID':agentID,
    //         'filter': filter,
    //         'startDate': startDate,
    //         'endDate': endDate,
    //         'pageSize': pageSize,
    //         'currentPage': currentPage
    //     };
    //     cti.send(data);
    // };
    // cti.getRecordList(startDate,endDate,resultType,qc,agentIDs,dst,pageSize,currentPage) {
    //     var thisDN = cti.Agent.getInstance().getThisDN();
    //     var agentID = cti.Agent.getInstance().getAgentID();
    //     var data = {
    //         'messageId':3001,
    //         'thisDN':thisDN,
    //         'agentID':agentID,
    //         'attachDatas': {
    //             'resultType': resultType,
    //             'qc': qc,
    //             'agentIDs': agentIDs,
    //             'startTime': startDate,
    //             'endTime': endDate,
    //             'dst':dst,
    //             'page': currentPage,
    //             'offSet': pageSize
    //         }};
    //     cti.send(data);
    // }
    // cti.sysSettingsUpdate(destDN, eventName, msg) {
    //     var thisDN = cti.Agent.getInstance().getThisDN();
    //     var agentID = cti.Agent.getInstance().getAgentID();
    //     var data = {"messageId":300,"thisDN":thisDN,"agentID":agentID,"destDN":destDN,"eventName":eventName,"msg":msg};
    //     cti.send(data);
    // };

    /**
     * 获取可监控的坐席信息
     */
    requestMonitorMembers() {
        let data = {
            "messageId": MessageID.RequestMonitorAgentList,
            "thisDN": this.agent.thisDN,
            "agentID": this.agent.agentID
        };
        this.connection.send(data);
    }
}

export default AgentApi;
