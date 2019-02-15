import Line from "./Line";
import {LineState, CallType, MessageID} from "../constants";
import EventEmitter from 'eventemitter3';

/**
 * 线路池<br/>
 * 一个坐席默认2条线路，可以通过构造函数修改初始值大小<br/>
 * 0号线路默认为主线路，两步转接会用到第二条线路
 */
class LinePool extends EventEmitter {

    constructor({
                    maxLines = 2
                } = {}) {
        super();
        this._maxLines = maxLines;
        this._lineId = 0;
        this._lines = new Array(this._maxLines);

        this.init();
    }

    /**
     * 初始化线路
     */
    init() {
        for (let index = 0; index < this._maxLines; index++) {
            // 数组下标即线路ID
            this._lines[index] = new Line(index);
        }
    }

    /**
     * 根据线路ID获取线路信息
     * @param lineId 线路ID
     * @returns {Line}  当lineId不存在则返回null
     */
    getLine(lineId) {
        if (this.checkLineId(lineId)) {
            for (let index = 0; index < this._maxLines; index++) {
                if (this._lines[index].id === lineId) {
                    return this._lines[index];
                }
            }
        }
        return null;
    }

    /**
     * 获取一个空闲线路，优先使用当前所在线路
     * @returns {Line}  当线路不存在则返回null
     */
    getIdleLine() {
        if (this.getCurrentLine().lineState === LineState.IDLE) {
            return this.getCurrentLine();
        } else {
            return this.getLineByState(LineState.IDLE);
        }
    }

    /**
     * 通话中的线路ID
     * @returns {Line}  当线路不存在则返回null
     */
    getTalkingLine() {
        return this.getLineByState(LineState.TALKING);
    }

    /**
     * 根据状态获取线路
     *
     * @param state
     * @returns {Line}  当线路不存在则返回null
     */
    getLineByState(state) {
        for (let index = 0; index < this._maxLines; index++) {
            if (this._lines[index].lineState === state) {
                return this._lines[index];
            }
        }
        return null;
    }

    /**
     * 根据callId获取所在线路
     * @param callId
     * @returns {Line}  当线路不存在则返回null
     */
    getLineByCallId(callId) {
        for (let index = 0; index < this._maxLines; index++) {
            if (this._lines[index].callId === callId) {
                return this._lines[index];
            }
        }
        return null;
    }

    /**
     * 获取咨询线路
     *
     * @returns {Line}  当线路不存在则返回null
     */
    getConsultLine() {
        for (let index = 0; index < this._maxLines; index++) {
            if (this._lines[index].callType === CallType.CONSULT) {
                return this._lines[index];
            }
        }
        return null;
    }

    /**
     * 设置当前线路ID，用于切换主线路
     * @param lineId
     */
    setCurrentLineId(lineId) {
        if (this.checkLineId(lineId)) {
            this._lineId = lineId;
        }
    }

    /**
     * 获取当前线路
     * @returns {number|*}
     */
    getCurrentLineId() {
        return this._lineId;
    }

    /**
     * 获取当前线路信息
     * @returns {Line}
     */
    getCurrentLine() {
        return this.getLine(this._lineId);
    }

    /**
     * 获取当前非空闲线路个数
     * @returns {number}
     */
    getWorkingLineCount() {
        let workingLineCount = 0;
        for (let index = 0; index < this._maxLines; index++) {
            if (this._lines[index].lineState !== LineState.IDLE) {
                workingLineCount++;
            }
        }
        return workingLineCount;
    }

    /**
     * 是否存在该呼叫类型的线路
     * @param callType
     * @returns {boolean}
     */
    isExistLineByCallType(callType) {
        for (let index = 0; index < this._maxLines; index++) {
            if (this._lines[index].callType === callType) {
                return true;
            }
        }
        return false;
    }

    /**
     * 验证线路是否合法
     * @param lineId
     */
    checkLineId(lineId) {
        return (null != lineId && lineId >= 0 && lineId < this._maxLines);
    }

    /**
     * 更新线路信息
     *
     * 拨号  MessageID.EventDialing: 505       呼出振铃
     * 振铃  MessageID.EventRinging: 503       呼入振铃
     * 接通  MessageID.EventEstablished: 506
     * 挂断  MessageID.EventReleased: 515
     * 保持  MessageID.EventHeld: 509
     * @param data
     */
    updateLineDate(data) {
        let event = data.messageId;
        let callInfo = this.parseCallInfo(data);

        let line = this.getLineByCallId(callInfo.callId);
        if (!line) {
            line = this.getCurrentLine();
        }
        // 当呼入振铃或者咨询时，选择一条空闲线路
        if (event === MessageID.EventRinging ||
            (event === MessageID.EventDialing && callInfo.callType === CallType.CONSULT)) {
            line = this.getIdleLine();
        }

        switch (event) {
            case MessageID.EventReleased:
            case MessageID.EventAbandoned:
                line.reset();
                break;
            case MessageID.EventDialing:
                line.lineState = LineState.DIALING;
                line.phoneNumber = callInfo.phoneNumber;
                line.callType = callInfo.callType;
                line.callId = callInfo.callId;
                break;
            case MessageID.EventRinging:
                line.lineState = LineState.RINGING;
                line.phoneNumber = callInfo.phoneNumber;
                line.callType = callInfo.callType;
                line.callId = callInfo.callId;
                break;
            case MessageID.EventEstablished:
                if (callInfo.callId == null || callInfo.callId === '') break;
                line.lineState = LineState.TALKING;
                line.phoneNumber = callInfo.phoneNumber;
                line.callType = callInfo.callType;
                line.callId = callInfo.callId;
                line.parties = [callInfo.phoneNumber];
                break;
            case MessageID.EventHeld:
                line.lineState = LineState.HELD;
                break;
            case MessageID.EventRetrieved:
                line.lineState = LineState.TALKING;
                break;
            default:
                break;
        }
        this.emit('lineDataChange', line, callInfo, data);
    }

    parseCallInfo(data) {
        let callId = data.callID;
        let callType = data.callType;
        let phoneNumber = data.otherDN && data.otherDN !== "Unknown" ? data.otherDN : '';
        let attachDatas = data.attachDatas;
        let creationTime = data.creationTime;
        let querue = data.thisQueue;

        let dnis = data.dnis;//被叫号码
        let callSid = data.auuid;//呼叫唯一标识
        let cityCode = data.cityCode;//归属地

        return {
            callId,
            callType,
            phoneNumber,
            attachDatas,
            creationTime,
            querue,
            dnis,
            callSid,
            cityCode,
        };
    }


    get maxLines() {
        return this._maxLines;
    }

    set maxLines(value) {
        this._maxLines = value;
    }

    get lines() {
        return this._lines;
    }

    set lines(value) {
        this._lines = value;
    }
}

export default LinePool;
