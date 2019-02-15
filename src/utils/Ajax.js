import utils from './utils';

/**
 * 检测原生XHR对象是否存在，如果存在刚返回它的新实例；
 * 如果不存在，则检测ActiveX对象;由于IE6的XMLHttpRequest对象是通过MSXML库中的一个ActiveX对象实现的。
 * 如果两个都不存在，就抛出一个错误。
 * @returns {*}
 */
function getXHR() {
    if (window.XMLHttpRequest) {
        return new XMLHttpRequest();
    } else {
        //遍历IE中不同版本的ActiveX对象
        let versions = ['Microsoft.XMLHTTP', 'MSXML2.XMLHTTP.5.0', 'MSXML2.XMLHTTP.4.0', 'MSXML2.XMLHTTP.3.0', 'MSXML2.XMLHTTP'];
        for (let i = 0, len = versions.length; i < len; i++) {
            try {
                return new ActiveXObject(versions[i]);
            } catch (ex) {
                //跳过
            }
        }
    }
}

function send(options) {

    let xhr = getXHR();

    let opt = {
        type: options.type || 'get',
        url: options.url || '',
        async: options.async || true,
        dataType: options.dataType || 'json',
        data: utils.parseParam(options.data) || ''
    };

    return new Promise((resolve, reject) => {

        xhr.open(opt.type, opt.url, opt.async);

        xhr.onreadystatechange = () => {
            // readyState: 0: init, 1: connect has set up, 2: recive request, 3: request.. , 4: request end, send response
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    var contentType = xhr.getResponseHeader('Content-Type');
                    if (opt.dataType === 'json') {
                        const data = JSON.parse(xhr.responseText);
                        resolve(data);
                    }
                } else {
                    reject(new Error(xhr.status || 'Server is fail.'));
                }
            }
        };

        xhr.onerror = () => {
            reject(new Error(xhr.status || 'Server is fail.'));
        };

        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.send(opt.data);

    });
}

const Ajax = {
    send
};

export default Ajax;
