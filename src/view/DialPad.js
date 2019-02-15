import '../css/dialpad.css';
import utils from "../utils/utils";
import Dialog from "./Dialog";

/**
 * 拨号盘UI控件
 */
class DialPad extends Dialog {

    constructor({
                    title = '',
                    contacts = [],
                    dynamicButton,
                    onHangupButtonClick
                }) {
        super({title});
        this._contacts = contacts;
        this.dynamicButton = dynamicButton;
        this.setContent(this._generateContentNode());

        utils.isFunction(onHangupButtonClick) && this.on('hangupButtonClick', onHangupButtonClick);
    }

    /**
     * 生成号码盘内容部分
     * @returns {HTMLDivElement}
     * @private
     */
    _generateContentNode() {
        let contentNode = document.createElement('div');
        contentNode.className = 'dialpad clearfloat';
        contentNode.onselectstart = () => {
            return false
        };

        if (this._contacts.length > 0) {
            contentNode.appendChild(this._generateContactSelectNode());
        }
        contentNode.appendChild(this._generatePhoneNumberNode());
        contentNode.appendChild(this._generateNumberPadNode());
        contentNode.appendChild(this._generateCallControllerNode());
        return contentNode;
    }

    /**
     * 生成联系人选择框节点
     * @returns {HTMLSelectElement}
     * @private
     */
    _generateContactSelectNode() {
        let contactSelectNode = document.createElement('select');
        contactSelectNode.className = 'single-line select_width';
        let options = '<option value="">--请选择电话号码--</option>';
        this._contacts.forEach((_contact) => {
            options += `<option value="${_contact.agentId}">${_contact.name}</option>`;
        });
        contactSelectNode.innerHTML = options;
        contactSelectNode.onchange = () => {
            contactSelectNode.value && (this.setPhoneNumber(contactSelectNode.value));
        };
        return contactSelectNode;
    }

    /**
     * 生成电话号码输入栏
     * @returns {HTMLDivElement}
     * @private
     */
    _generatePhoneNumberNode() {
        let phoneNumberParentNode = document.createElement('div');
        phoneNumberParentNode.className = 'input-group';

        // 电话号码输入框
        let phoneNumberNode = document.createElement('div');
        phoneNumberNode.className = 'phoneNumber';
        let phoneNumberTextField = this._phoneNumberTextField = document.createElement('input');
        phoneNumberTextField.type = 'text';
        phoneNumberTextField.className = 'number';
        phoneNumberTextField.name = 'phoneNumber';
        phoneNumberNode.appendChild(phoneNumberTextField);

        // 号码盘显示隐藏切换按钮
        let slideDialPadBtn = document.createElement('button');
        slideDialPadBtn.type = 'button';
        slideDialPadBtn.className = 'cc-btn btn-white slidedialpad';
        slideDialPadBtn.title = '数字键盘';
        slideDialPadBtn.innerHTML = '<i class="icon-slidedialpad"></i>';
        slideDialPadBtn.onclick = this.toggleExpandNumberPad.bind(this);

        phoneNumberParentNode.appendChild(phoneNumberNode);
        phoneNumberParentNode.appendChild(slideDialPadBtn);
        return phoneNumberParentNode;
    }

    toggleExpandNumberPad() {
        let _visible = this.numberPadNode.style.display !== "none";
        if (_visible) {
            this.numberPadNode.style.display = 'none';
        } else {
            this.numberPadNode.style.display = 'block';
        }
    }

    setPhoneNumber(phoneNmuber) {
        this._phoneNumberTextField.value = phoneNmuber;
    }

    getPhoneNumber() {
        return this._phoneNumberTextField.value || '';
    }

    /**
     * 生成数字号码盘节点
     * @returns {HTMLUListElement}
     * @private
     */
    _generateNumberPadNode() {
        let numberPadNode = this.numberPadNode = document.createElement('ul');
        numberPadNode.className = 'numberpad clearfloat';
        numberPadNode.style.display = 'none';

        for (let i = 1; i <= 12; i++) {
            let keyButton = document.createElement('li');
            switch (i) {
                case 10:
                    keyButton.innerText = '*';
                    break;
                case 11:
                    keyButton.innerText = 0;
                    break;
                case 12:
                    keyButton.innerText = '#';
                    break;
                default:
                    keyButton.innerText = i;
                    break;
            }
            keyButton.onclick = this._onKeyClick.bind(this, keyButton.innerText);
            numberPadNode.appendChild(keyButton);
        }

        return numberPadNode;
    }

    _onKeyClick(number) {
        this.setPhoneNumber(this.getPhoneNumber() + number);
    }

    /**
     * 生成控制按钮，包含拨号、清除、挂断、咨询、转出
     * @returns {HTMLUListElement}
     * @private
     */
    _generateCallControllerNode() {
        let ctlBtnNode = document.createElement('ul');
        ctlBtnNode.className = 'clearfix';

        // 清除键
        let removeButton = document.createElement('li');
        removeButton.className = 'remove';
        removeButton.title = '清除';
        removeButton.innerText = '清除';
        removeButton.onclick = () => {
            let phoneNumber = this.getPhoneNumber();
            this.setPhoneNumber(phoneNumber.substr(0, phoneNumber.length - 1));
        };
        removeButton.ondblclick = () => {
            this.setPhoneNumber('')
        };

        // 挂机键
        let hangupButton = document.createElement('li');
        hangupButton.className = 'hangup';
        hangupButton.title = '挂断';
        hangupButton.innerHTML = '<i class="icon-hangup"></i>';
        hangupButton.onclick = () => {
            this.emit('hangupButtonClick');
        };

        if (this.dynamicButton) {
            ctlBtnNode.appendChild(this.dynamicButton);
        }
        ctlBtnNode.appendChild(removeButton);
        ctlBtnNode.appendChild(hangupButton);
        return ctlBtnNode;
    }

    static createButton({
                            id,
                            tagName = 'li',
                            btnName,
                            className,
                            onClick
                        }) {
        let button = document.createElement(tagName);
        id && (button.id = id);
        className && (button.className = className);
        btnName && (button.title = btnName);
        btnName && (button.innerText = btnName);
        utils.isFunction(onClick) && (button.onclick = onClick);
        return button;
    }

    destroy() {
        super.destroy();
        this.removeAllListeners('hangupButtonClick');
    }
}

export default DialPad;
