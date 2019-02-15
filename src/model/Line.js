import {LineState} from "../constants";


/**
 * 线路信息数据对象
 */
class Line {

    constructor(id) {
        this._lineState = LineState.IDLE;
        this._phoneNumber = '';
        this._callType = -1;
        this._callId = '';
        this._parties = [];
        this._id = id;
    }

    reset() {
        this._lineState = LineState.IDLE;
        this._phoneNumber = '';
        this._callType = -1;
        this._callId = '';
        this._parties = [];
    }


    get id() {
        return this._id;
    }

    set id(value) {
        this._id = value;
    }

    get lineState() {
        return this._lineState;
    }

    set lineState(value) {
        this._lineState = value;
    }

    get phoneNumber() {
        return this._phoneNumber;
    }

    set phoneNumber(value) {
        this._phoneNumber = value;
    }

    get callType() {
        return this._callType;
    }

    set callType(value) {
        this._callType = value;
    }

    get callId() {
        return this._callId;
    }

    set callId(value) {
        this._callId = value;
    }

    get parties() {
        return this._parties;
    }

    set parties(value) {
        this._parties = value;
    }
}

export default Line;
