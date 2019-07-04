const utils = {
    /**
     * 用户可以覆盖的弹窗方法
     *
     * 缺省插件以alert方式弹出
     * @param msg
     */
    showMessage(msg) {
        alert(msg);
    },
    /**
     * 验证号码是否合法
     * @param num
     * @returns {boolean}
     */
    checkPhoneNumber(num) {
        if (num == null || num.length === 0)
            return false;
        else {
            let validNumber = "*#0123456789";
            num = this.trim(num);
            if (num.indexOf("ivr_") === 0) {
                return true;
            }
            for (let i = 0; i < num.length; i++) {
                let c = num.charAt(i);
                if (validNumber.indexOf(c) === -1) {
                    this.showMessage("输入的电话号码不符合规范,请检查是否含有空格或者其他非数字字符.");
                    return false;
                }
            }
            return true;
        }
    },
    /**
     * json转url参数
     * @param param
     * @returns {string}
     */
    parseParam(param) {
        let paramArray = [];
        if (param) {
            Object.keys(param).forEach(function (value) {
                paramArray.push(`${encodeURIComponent(value)}=${encodeURIComponent(param[value])}`)
            });
        }
        return paramArray.join('&');
    },
    isFunction(f) {
        return typeof f === 'function';
    },
    firstUpperCase(str) {
        return str.replace(/( |^)[a-z]/g, (c) => c.toUpperCase());
    },
    trim(str) {
        return str.replace(/(^\s*)|(\s*$)/g, '');
    }
};

export default utils;
