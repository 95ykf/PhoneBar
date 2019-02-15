/**
 * 日志打印类，用于用户复写后自定义显示
 */
class Log {

    static log(message, ...args) {
        console.log(message, ...args);
    }

    static info(message, ...args) {
        console.info(message, ...args);
    }

    static error(message, ...args) {
        console.error(message, ...args);
    }

}

export default Log;
