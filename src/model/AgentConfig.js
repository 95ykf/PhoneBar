import EventEmitter from 'eventemitter3';

/**
 * 坐席设置纯数据对象
 */
class AgentConfig extends EventEmitter {

    /**
     * @param tipTime  设置后每隔*分钟会自动提醒某一状态是否超时;默认0不提醒
     * @param autoIdleWhenAfterWork  话后自动进入就绪状态;默认null未配置,false不启用
     * @param maxAfterWorkTime  话后持续设置时间后会自动进入就绪状态;默认0不启用
     * @param autoIdleWhenLogin  登录后自动置闲
     * @param isPhoneTakeAlong  是否手机随行，即手机在线，默认为false
     * @param workPhone  随行手机号
     * @param autoAnswer  自动应答
     */
    constructor({
                    tipTime = 0,

                    autoIdleWhenAfterWork = null,
                    maxAfterWorkTime = 0,
                    autoIdleWhenLogin = false,
                    isPhoneTakeAlong = false,
                    workPhone = '',
                    autoAnswer = false
                }) {
        super();
        this._tipTime = tipTime;
        this._autoIdleWhenAfterWork = autoIdleWhenAfterWork;
        this._maxAfterWorkTime = maxAfterWorkTime;
        this._autoIdleWhenLogin = autoIdleWhenLogin;
        this._isPhoneTakeAlong = isPhoneTakeAlong;
        this._workPhone = workPhone;
        this._autoAnswer = autoAnswer;
    }

    get tipTime() {
        return this._tipTime;
    }

    set tipTime(value) {
        if (this._tipTime !== value) {
            this._tipTime = value;
            this.emit('change', this, 'tipTime', value);
        }
    }

    get autoIdleWhenAfterWork() {
        return this._autoIdleWhenAfterWork;
    }

    set autoIdleWhenAfterWork(value) {
        this._autoIdleWhenAfterWork = value;
    }

    get maxAfterWorkTime() {
        return this._maxAfterWorkTime;
    }

    set maxAfterWorkTime(value) {
        if (this._maxAfterWorkTime !== value) {
            this._maxAfterWorkTime = value;
            this.emit('change', this, 'maxAfterWorkTime', value);
        }
    }

    get autoIdleWhenLogin() {
        return this._autoIdleWhenLogin;
    }

    set autoIdleWhenLogin(value) {
        if (this._autoIdleWhenLogin !== value) {
            this._autoIdleWhenLogin = value;
            this.emit('change', this, 'autoIdleWhenLogin', value);
        }
    }

    get isPhoneTakeAlong() {
        return this._isPhoneTakeAlong;
    }

    set isPhoneTakeAlong(value) {
        if (this._isPhoneTakeAlong !== value) {
            this._isPhoneTakeAlong = value;
            this.emit('change', this, 'isPhoneTakeAlong', value);
        }
    }

    get workPhone() {
        return this._workPhone;
    }

    set workPhone(value) {
        if (this._workPhone !== value) {
            this._workPhone = value;
            this.emit('change', this, 'workPhone', value);
        }
    }

    get autoAnswer() {
        return this._autoAnswer;
    }

    set autoAnswer(value) {
        if (this._autoAnswer !== value) {
            this._autoAnswer = value;
            this.emit('change', this, 'autoAnswer', value);
        }
    }

    set(key, value) {
        if (this[`_${key}`] === value) {
            return;
        }
        this[`_${key}`] = value;
        this.emit('change', this, key, value);
    }
}

export default AgentConfig;
