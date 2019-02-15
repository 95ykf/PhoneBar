import utils from "../utils/utils";
import PhoneBarButton from "./PhoneBarButton";

/**
 * 多级菜单组件
 * 当菜单被选点击时触发imteClick事件
 */
class MultilevelMenu extends PhoneBarButton {

    constructor({
                    title = '',
                    iconClassName,
                    visible = true,
                    enabled = false,
                    menuData,
                    onItemClick
                }) {
        super({
            title,
            className: 'operation multilevelMenu',
            iconClassName, visible, enabled});

        this.menuData = menuData;
        this._openClassName = 'open';

        this.on('click', (e) => { this._toggleMenu(e)});
        document.addEventListener('click', this.onBodyClick = this._hideMenu.bind(this));
        this.rootNode.onmouseleave = () => {this._hideMenu()};

        utils.isFunction(onItemClick) && this.on('itemClick', onItemClick);

        this.rootNode.appendChild(this.generateMenu());
    }

    generateMenu() {
        let menuNode = this.menuNode = document.createElement('ul');
        menuNode.className = 'menu-list-box';
        menuNode.style.display = "none";
        menuNode.appendChild(this.generateSubMenu(this.menuData));
        return menuNode;
    }

    generateSubMenu(data) {
        let fragment = document.createDocumentFragment();
        data && data.forEach((val) => {
            let menu = document.createElement('li');
            if (val.menu.length > 0) {
                let textNode = document.createElement('h3');
                textNode.innerHTML = `${val.name}<span class="list"></span>`;

                let subMenu = document.createElement('ul');
                subMenu.appendChild(this.generateSubMenu(val.menu));

                menu.onmouseenter = () => {subMenu.style.display = 'block';};
                menu.onmouseleave = () => {subMenu.style.display = 'none';};
                menu.appendChild(textNode);
                menu.appendChild(subMenu);
            } else {
                let textNode = document.createElement('h3');
                textNode.onclick = () => {
                    this.emit('itemClick', val);
                };
                textNode.innerText = val.name;
                menu.appendChild(textNode);
            }
            fragment.appendChild(menu);
        });
        return fragment;
    }

    updateMenuData(menuData) {
        this.menuData = menuData;
        if (this.menuNode && this.menuNode.parentNode) {
            this.menuNode.parentNode.removeChild(this.menuNode);
        }
        this.rootNode.appendChild(this.generateMenu());
    }

    _hideMenu() {
        let _visible = this.menuNode.style.display !== "none";
        if (_visible) {
            this.menuNode.style.display = 'none';
            if (this.rootNode.classList.contains(this._openClassName)){
                this.rootNode.classList.remove(this._openClassName);
            }
        }
    }
    _toggleMenu(e) {
        let _visible = this.menuNode.style.display !== "none";
        if (_visible) {
            this._hideMenu();
        } else {
            this.menuNode.style.display = 'block';
            this.rootNode.classList.add(this._openClassName);
        }
        e.stopPropagation();
    }


    destroy() {
        super.destroy();
        this.removeAllListeners('itemClick');
    }
}

export default MultilevelMenu;
