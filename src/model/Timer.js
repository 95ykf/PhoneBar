import EventEmitter from "eventemitter3";

/**
 * 定时器
 */
class Timer extends EventEmitter {

    constructor(seconds = 0) {
        super();
        this.seconds = seconds;
        this.startTime = new Date().getTime() - seconds * 1000;
        this.unexecutedTimeouts = [];
    }

    /**
     * 开始一个任务
     *
     * @returns {Timer} 当前对象
     */
    start() {
        this.seconds++;
        this._clearUnexecutedTimeouts();
        // 计算时间误差值
        let offset = new Date().getTime() - (this.startTime + this.seconds * 1000);
        let nextTime = 1000 > offset ? (1000 - offset) : 0;
        this.unexecutedTimeouts.push(setTimeout(() => {
            this.start();
        }, nextTime));
        // 时间执行不阻塞计时任务
        setTimeout(() => {
            this.emit('change', this.seconds, this.format())
        });
        return this;
    }

    /**
     * 停止一个任务
     *
     * @returns {Timer} 当前对象
     */
    stop() {
        this._clearUnexecutedTimeouts();
        this.seconds = 0;

        return this;
    }

    /**
     * 任务重启
     */
    restart(seconds = 0) {
        this.stop();
        // 设置计时开始时间
        this.seconds = seconds;
        this.startTime = new Date().getTime() - seconds * 1000;
        this.start();
    }

    /**
     * 清除未执行的任务
     *
     * @private
     */
    _clearUnexecutedTimeouts() {
        this.unexecutedTimeouts.forEach((unexecuted) => {
            clearTimeout(unexecuted);
        });
        this.unexecutedTimeouts = [];
    }

    format(separator = [':', ':', '']) {
        let secondTime = this.seconds;// 秒
        let minuteTime = 0;// 分
        let hourTime = 0;// 小时
        if (secondTime > 60) {
            minuteTime = Math.floor(secondTime / 60);
            secondTime = Math.floor(secondTime % 60);
            if (minuteTime > 60) {
                hourTime = Math.floor(minuteTime / 60);
                minuteTime = Math.floor(minuteTime % 60);
            }
        }
        let result = "";
        if (hourTime > 0) {
            result += ((hourTime < 10) ? '0' : '') + hourTime + separator[0];
        }
        result += ((minuteTime < 10) ? '0' : '') + minuteTime + separator[1];
        result += ((secondTime < 10) ? '0' : '') + secondTime + separator[2];
        return result;
    }
}


export default Timer;
