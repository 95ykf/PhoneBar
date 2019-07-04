import utils from "../utils/utils";
import Dialog from "./Dialog";

/**
 * 拨号盘UI控件
 */
class ThreewayCallBox extends Dialog {

    constructor({
                    title = '',
                    onJoinButtonClick,
                    onRemoveCallButtonClick,
                    onRemoveAllCallButtonClick
                }) {
        super({title});
        this.phoneMap = {};
        this.setContent(this._generateContentNode());

        utils.isFunction(onJoinButtonClick) && this.on('joinButtonClick', onJoinButtonClick);
        utils.isFunction(onRemoveCallButtonClick) && this.on('removeCallButtonClick', onRemoveCallButtonClick);
        utils.isFunction(onRemoveAllCallButtonClick) && this.on('removeAllCallButtonClick', onRemoveAllCallButtonClick);
    }

    /**
     * 覆盖父类方法，默认隐藏窗口
     */
    onClose() {
        this.hide();
    }

    /**
     * 生成号码盘内容部分
     * @returns {HTMLDivElement}
     * @private
     */
    _generateContentNode() {
        let box = document.createElement('div');
        box.className = 'threewayCallBox';

        box.appendChild(this._generatePhoneNumberNode());

        let thirdPhoneNumberNode = this.thirdPhoneNumberNode = document.createElement('div');
        thirdPhoneNumberNode.className = 'calloption';
        box.appendChild(thirdPhoneNumberNode);

        box.appendChild(this._generateCallControllerNode());

        return box;
    }


    /**
     * 生成电话号码输入栏
     * @returns {HTMLDivElement}
     * @private
     */
    _generatePhoneNumberNode() {
        let phoneNumberParentNode = document.createElement('div');
        phoneNumberParentNode.className = 'row';

        // label
        let labelNode = document.createElement('label');
        labelNode.innerText = '加入指定电话或分机号';

        // 电话号码输入框
        let phoneNumberTextField = this._phoneNumberTextField = document.createElement('input');
        phoneNumberTextField.type = 'text';
        phoneNumberTextField.name = 'inputThreewayDN';

        // 号码盘显示隐藏切换按钮
        let joinBtn = document.createElement('button');
        joinBtn.type = 'button';
        joinBtn.innerText = '加入';
        joinBtn.title = '加入';
        joinBtn.onclick = () => {this.emit('joinButtonClick', phoneNumberTextField.value)};

        phoneNumberParentNode.appendChild(labelNode);
        phoneNumberParentNode.appendChild(phoneNumberTextField);
        phoneNumberParentNode.appendChild(joinBtn);
        return phoneNumberParentNode;
    }

    /**
     * 加入会议列表
     * @param phoneNumber
     * @param callID
     */
    join(phoneNumber, callID) {
        // 只有会议列表中不存在才添加
        if (!this.phoneMap[phoneNumber]) {
            let labelNode = document.createElement('label');
            let checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = callID;
            labelNode.appendChild(checkbox);
            labelNode.appendChild(document.createTextNode(phoneNumber));
            this.phoneMap[phoneNumber] = labelNode;
            this.thirdPhoneNumberNode.appendChild(labelNode);
        }
    }

    /**
     * 踢出会议列表
     * @param phoneNumber
     */
    remove(phoneNumber) {
        let phoneNode = this.phoneMap[phoneNumber];
        if (phoneNode && phoneNode.parentNode) {
            phoneNode.parentNode.removeChild(phoneNode);
        }
    }

    /**
     * 生成控制按钮，包含全选、踢出选中、踢出所有、关闭
     * @returns {HTMLDivElement}
     * @private
     */
    _generateCallControllerNode() {
        let ctlBtnNode = document.createElement('div');
        ctlBtnNode.className = 'row';

        let leftBtnsNode = document.createElement('div');
        leftBtnsNode.className = 'pull-left';
        // 全选
        let checkAllLabel = document.createElement('label');
        let checkAllButton = this._checkAllButton = document.createElement('input');
        checkAllButton.type = 'checkbox';
        checkAllButton.className = 'checkAll';
        checkAllButton.onchange = () => {
            if (checkAllButton.checked === true) {
                Object.keys(this.phoneMap).forEach((key) => {
                    this.phoneMap[key].firstElementChild.checked = true;
                });
            } else {
                Object.keys(this.phoneMap).forEach((key) => {
                    this.phoneMap[key].firstElementChild.checked = false;
                });
            }
        };
        checkAllLabel.appendChild(checkAllButton);
        checkAllLabel.appendChild(document.createTextNode('全选'));
        leftBtnsNode.appendChild(checkAllLabel);

        let rightBtnsNode = document.createElement('div');
        rightBtnsNode.className = 'pull-right';
        //踢出选中通话
        let removeSelectedButton = document.createElement('button');
        removeSelectedButton.type = 'button';
        removeSelectedButton.innerText = '踢出选中通话';
        removeSelectedButton.onclick = () => {
            Object.keys(this.phoneMap).forEach((key) => {
                if (this.phoneMap[key] && this.phoneMap[key].firstElementChild.checked) {
                    this.emit('removeCallButtonClick', this.phoneMap[key].firstElementChild.value);
                }
            });
        };
        //踢出全部通话
        let removeAllButton = document.createElement('button');
        removeAllButton.type = 'button';
        removeAllButton.innerText = '踢出全部通话';
        removeAllButton.onclick = () => {this.emit('removeAllCallButtonClick')};
        //关闭
        let closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.innerText = '关闭';
        closeButton.onclick = () => {this.onClose()};
        rightBtnsNode.appendChild(removeSelectedButton);
        rightBtnsNode.appendChild(removeAllButton);
        rightBtnsNode.appendChild(closeButton);


        ctlBtnNode.appendChild(leftBtnsNode);
        ctlBtnNode.appendChild(rightBtnsNode);
        return ctlBtnNode;
    }


    destroy() {
        super.destroy();

        this.removeAllListeners('joinButtonClick');
        this.removeAllListeners('removeCallButtonClick');
        this.removeAllListeners('removeAllCallButtonClick');
    }
}

export default ThreewayCallBox;
