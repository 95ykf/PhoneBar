import '../css/phonebar.css'
import EventEmitter from 'eventemitter3';
import PhoneBarButton from "./PhoneBarButton";
import AgentStateMenu from "./AgentStateMenu";
import {CallType} from "../constants";
import MultilevelMenu from "./MultilevelMenu";

let autoIncrementId = 0;
const emptyFunction = function () {
};

/**
 * 电话条控件
 */
class PhoneBarComponent extends EventEmitter {

    constructor() {
        super();

        this.id = `phoneBar-${autoIncrementId++}`;
        this._rootNodeClassName = 'phonebar-nav';

        this.buttonList = [
            {
                'name': 'agentState', 'component': new AgentStateMenu(), 'sort': '1'
            },
            {
                'name': 'openDialPad', 'component': new PhoneBarButton({
                    title: '呼出',
                    iconClassName: 'opendialpad'
                }), 'sort': 2
            },
            {
                'name': 'answer', 'component': new PhoneBarButton({
                    title: '应答',
                    iconClassName: 'answer'
                }), 'sort': 3
            },
            {
                'name': 'hangup', 'component': new PhoneBarButton({
                    title: '挂断',
                    iconClassName: 'hangup'
                }), 'sort': 4
            },
            {
                'name': 'hold', 'component': new PhoneBarButton({
                    title: '保持',
                    iconClassName: 'hold'
                }), 'sort': 5
            },
            {
                'name': 'retrieve', 'component': new PhoneBarButton({
                    title: '接回',
                    iconClassName: 'retrieve'
                }), 'sort': 6
            },
            {
                'name': 'transfer', 'component': new MultilevelMenu({
                    title: '转接',
                    iconClassName: 'transfer'
                }), 'sort': 7
            },
            {
                'name': 'rollout', 'component': new PhoneBarButton({
                    title: '转出',
                    iconClassName: 'rollout'
                }), 'sort': 8
            },
            {
                'name': 'conference', 'component': new MultilevelMenu({
                    title: '会议',
                    iconClassName: 'conference'
                }), 'sort': 9
            }
        ];

        this.create();
    }

    create() {
        if (!this.rootNode) {
            let rootNode = this.rootNode = document.createElement('ul');
            rootNode.id = this.id;
            rootNode.className = this._rootNodeClassName;

            this.buttonList.sort((a, b) => {
                return a.sort - b.sort;
            }).forEach((item) => {
                rootNode.appendChild(item.component.rootNode);
            });

            this.hide();
        }
    }

    /**
     * 根据名称获取组件对象
     * @param buttonName  按钮名称
     * @returns {null|Object}  查询结果组件对象或者null
     */
    getButtonComponent(buttonName) {
        for (let i = 0, len = this.buttonList.length; i < len; i++) {
            if (this.buttonList[i].name === buttonName) {
                return this.buttonList[i].component;
            }
        }
        return null;
    }


    /**
     * SIP话机不可用
     */
    changeButtonSipNG() {
        console.log('changeButtonSipNG');
        this.getButtonComponent("openDialPad").disable();
        this.getButtonComponent("answer").disable();
        this.getButtonComponent("hangup").disable();
        this.getButtonComponent("hold").disable();
        this.getButtonComponent("retrieve").disable();
        this.getButtonComponent("transfer").disable();
        this.getButtonComponent("rollout").disable();
        this.getButtonComponent("conference").disable();
    }

    /**
     * SIP话机注册成功
     */
    changeButtonSipOK() {
        console.log('changeButtonSipOK');
        this.getButtonComponent("openDialPad").enable();
        this.getButtonComponent("answer").disable();
        this.getButtonComponent("hangup").disable();
        this.getButtonComponent("hold").disable();
        this.getButtonComponent("retrieve").disable();
        this.getButtonComponent("transfer").disable();
        this.getButtonComponent("rollout").disable();
        this.getButtonComponent("conference").disable();
    }

    /**
     * 非就绪状态时按钮状态
     */
    changeButtonWhenNotReady() {
        console.log('changeButtonWhenNotReady');
        this.getButtonComponent("openDialPad").enable();
        this.getButtonComponent("answer").disable();
        this.getButtonComponent("hangup").disable();
        this.getButtonComponent("hold").disable();
        this.getButtonComponent("retrieve").disable();
        this.getButtonComponent("transfer").disable();
        this.getButtonComponent("rollout").disable();
        this.getButtonComponent("conference").disable();
    }

    /**
     * 就绪时的按钮状态
     */
    changeButtonWhenReady() {
        console.log('changeButtonWhenReady');
        this.getButtonComponent("openDialPad").enable();
        this.getButtonComponent("answer").disable();
        this.getButtonComponent("hangup").disable();
        this.getButtonComponent("hold").disable();
        this.getButtonComponent("retrieve").disable();
        this.getButtonComponent("transfer").disable();
        this.getButtonComponent("rollout").disable();
        this.getButtonComponent("conference").disable();
    }

    /**
     * 登出时的按钮状态
     */
    changeButtonWhenLogout() {
        console.log('changeButtonWhenLogout');
        this.getButtonComponent("openDialPad").disable();
        this.getButtonComponent("answer").disable();
        this.getButtonComponent("hangup").disable();
        this.getButtonComponent("hold").disable();
        this.getButtonComponent("retrieve").disable();
        this.getButtonComponent("transfer").disable();
        this.getButtonComponent("rollout").disable();
        this.getButtonComponent("conference").disable();
    }

    /**
     * 呼入时的按钮状态
     */
    changeButtonWhenRinging() {
        console.log('changeButtonWhenRinging');
        this.getButtonComponent("openDialPad").disable();
        this.getButtonComponent("answer").enable();
        this.getButtonComponent("hangup").enable();
        this.getButtonComponent("hold").disable();
        this.getButtonComponent("retrieve").disable();
        this.getButtonComponent("transfer").disable();
        this.getButtonComponent("rollout").disable();
        this.getButtonComponent("conference").disable();
    }

    /**
     * 外呼时的按钮状态
     * @param callType  呼叫类型
     */
    changeButtonWhenDialing(callType) {
        console.log('changeButtonWhenDialing');
        this.getButtonComponent("openDialPad").disable();
        this.getButtonComponent("hangup").enable();
        this.getButtonComponent("hold").disable();
        this.getButtonComponent("retrieve").disable();
        this.getButtonComponent("transfer").disable();
        this.getButtonComponent("rollout").disable();
        this.getButtonComponent("conference").disable();
        if (callType === CallType.PREDICT || callType === CallType.MONITOR) {
            this.getButtonComponent("answer").enable();
        } else {
            this.getButtonComponent("answer").disable();
        }
    }

    /**
     * 通话时的按钮状态
     * @param callType
     */
    changeButtonWhenTalking(callType) {
        console.log('changeButtonWhenTalking');
        this.getButtonComponent("openDialPad").disable();
        this.getButtonComponent("answer").disable();
        this.getButtonComponent("hangup").enable();
        this.getButtonComponent("hold").enable();
        this.getButtonComponent("retrieve").disable();
        this.getButtonComponent("transfer").disable();
        this.getButtonComponent("rollout").disable();
        this.getButtonComponent("conference").enable();
        if (callType === CallType.INTERNAL) {
            this.getButtonComponent("transfer").disable();
        } else if (callType === CallType.CONSULT) {
            this.getButtonComponent("hold").disable();
            this.getButtonComponent("transfer").disable();
            this.getButtonComponent("conference").disable();
        } else {
            this.getButtonComponent("transfer").enable();
        }
    };

    /**
     * 通话保持时的按钮状态
     */
    changeButtonWhenHold() {
        console.log('changeButtonWhenHold');
        this.getButtonComponent("openDialPad").disable();
        this.getButtonComponent("answer").disable();
        this.getButtonComponent("hangup").disable();
        this.getButtonComponent("hold").disable();
        this.getButtonComponent("retrieve").enable();
        this.getButtonComponent("transfer").disable();
        this.getButtonComponent("rollout").disable();
        this.getButtonComponent("conference").disable();
    };

    /**
     * 挂断电话时的按钮状态
     */
    changeButtonWhenIdle() {
        console.log('changeButtonWhenIdle');
        this.getButtonComponent("openDialPad").enable();
        this.getButtonComponent("answer").disable();
        this.getButtonComponent("hangup").disable();
        this.getButtonComponent("hold").disable();
        this.getButtonComponent("retrieve").disable();
        this.getButtonComponent("transfer").disable();
        this.getButtonComponent("rollout").disable();
        this.getButtonComponent("conference").disable();
    };

    /**
     * 两步主叫=>转接时的按钮状态
     */
    changeButtonWhenDouble() {
        console.log('changeButtonWhenDouble');
        this.getButtonComponent("openDialPad").disable();
        this.getButtonComponent("answer").disable();
        this.getButtonComponent("hangup").disable();
        this.getButtonComponent("hold").disable();
        this.getButtonComponent("retrieve").enable();
        this.getButtonComponent("transfer").disable();
        this.getButtonComponent("rollout").enable();
        this.getButtonComponent("conference").disable();
    }

    /**
     * 两步被叫=>转接时的按钮状态
     */
    changeButtonWhenDoubleCalled() {
        console.log('changeButtonWhenDoubleCalled');
        this.getButtonComponent("transfer").disable();
        this.getButtonComponent("hold").disable();
    }

    /**
     * 两步转接-挂断的按钮状态
     */
    changeButtonWhenDoubleDiscon() {
        console.log('changeButtonWhenDoubleDiscon');
        this.getButtonComponent("rollout").disable();
    }

    /**
     * 两步转接-未转出-客户挂断的按钮状态
     */
    changeButtonWhenCustomerDiscon() {
        console.log('changeButtonWhenCustomerDiscon');
        this.getButtonComponent("openDialPad").disable();
        this.getButtonComponent("hangup").enable();
    }


    destroy() {
        if (this.rootNode && this.rootNode.parentNode) {
            this.rootNode.parentNode.removeChild(this.rootNode);
        }
    }

    show() {
        this.rootNode.style.display = 'block';
        return this;
    }

    hide() {
        this.rootNode.style.display = 'none';
        return this;
    }

}

export default PhoneBarComponent;
