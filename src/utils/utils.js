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
    },
    replaceTimeSeparator(time, pattern = [':', ':', ':']) {
        if (time) {
            let timeArr = time.split(':').reverse();
            pattern = pattern.reverse();
            for (let i = 0, len = timeArr.length; i < len; i++) {
                timeArr[i] = parseInt(timeArr[i], 10);
                if (timeArr[i] === 0) {
                    timeArr[i] = '';
                } else {
                    timeArr[i] += pattern[i];
                }
            }
            return timeArr.reverse().join('');
        }
        return '';
    },
    formatDate(date, pattern = 'yyyy-MM-dd HH:mm:ss') {
        if (/(y+)/.test(pattern)) {
            pattern = pattern.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
        }
        let o = {
            'M+': date.getMonth() + 1,
            'd+': date.getDate(),
            'H+': date.getHours(),
            'm+': date.getMinutes(),
            's+': date.getSeconds(),
        };

        // 遍历这个对象
        for (let k in o) {
            if (new RegExp(`(${k})`).test(pattern)) {
                let str = o[k] + '';
                pattern = pattern.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
            }
        }
        return pattern;
    }
};

export default utils;
