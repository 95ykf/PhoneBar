import EventEmitter from 'eventemitter3';
import utils from "../utils/utils";

let autoIncrementId = 0;

class PhoneBarButton extends EventEmitter {

    constructor({
                    title = '',
                    className = 'operation',
                    iconClassName = '',
                    textClassName = 'operation_text',
                    visible = true,
                    enabled = false,
                    onClick
                }) {
        super();

        this.id = `phoneBarButton-${autoIncrementId++}`;
        this._title = title;
        this._className = className;
        this._iconClassName = iconClassName;
        this._textClassName = textClassName;

        this._visible = visible;
        this._enabled = enabled;
        this._disabledClassName = 'disabled';

        utils.isFunction(onClick) && this.on('click', onClick);

        this.create();
    }

    create() {
        if (!this.rootNode) {
            let rootNode = this.rootNode = document.createElement('li');
            rootNode.id = this.id;
            rootNode.className = this._className;
            rootNode.onclick = (e) => {this.emit('click', e)};

            this._visible || this.hide();
            this._enabled || rootNode.classList.add(this._disabledClassName);

            rootNode.appendChild(this.generateIconNode());
            rootNode.appendChild(this.generateTextNode());
        }
        return this;
    }

    /**
     * 创建按钮图标
     * @returns {HTMLElement}
     */
    generateIconNode() {
        let iconNode = document.createElement('em');
        iconNode.className = this._iconClassName;
        return iconNode;
    }

    generateTextNode() {
        let textNode = document.createElement('span');
        textNode.className = this._textClassName;
        textNode.innerText = this._title;
        return textNode;
    }

    destroy() {
        if (this.rootNode && this.rootNode.parentNode) {
            this.rootNode.parentNode.removeChild(this.rootNode);
        }
    }

    show() {
        this._visible = true;
        this.rootNode.style.display = 'block';
        return this;
    }

    hide() {
        this._visible = false;
        this.rootNode.style.display = 'none';
        return this;
    }

    enable() {
        if (!this._enabled) {
            this._enabled = true;
            if (this.rootNode.classList.contains(this._disabledClassName)){
                this.rootNode.classList.remove(this._disabledClassName);
            }
        }
        return this;
    }

    disable() {
        if (this._enabled) {
            this._enabled = false;
            this.rootNode.classList.add(this._disabledClassName);
        }
        return this;
    }


    emit(event, ...args) {
        if (this._enabled) {
            return super.emit(event, ...args);
        } else {
            return false;
        }
    }

    setTitle(value) {
        this._title = value;
    }

    setDisabledClassName(value) {
        this._disabledClassName = value;
    }
}

export default PhoneBarButton;
