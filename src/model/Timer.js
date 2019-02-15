import EventEmitter from "eventemitter3";

/**
 * 定时器
 */
class Timer extends EventEmitter{

    constructor() {
        super();
        this.second = 0;
        this.minute = 0;
        this.hour = 0;
        this.seconds = 0;
        this.timeValue = '00:00';
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

        this.second++;
        if (this.second === 60) {
            this.second = 0;
            this.minute += 1;
        }
        if (this.minute === 60) {
            this.minute = 0;
            this.hour += 1;
        }
        this.timeValue = ((this.minute < 10) ? "0" : "") + this.minute;
        this.timeValue += ((this.second < 10) ? ":0" : ":") + this.second;
        if (this.hour > 0) {
            this.timeValue = ((this.hour < 10) ? "0" : "") + this.hour + ":" + this.timeValue;
        }

        this.emit('change', this.seconds, this.timeValue);

        this.unexecutedTimeouts.push(setTimeout(() => {
            this.start();
        }, 1000));
        return this;
    }

    /**
     * 停止一个任务
     *
     * @returns {Timer} 当前对象
     */
    stop() {
        this._clearUnexecutedTimeouts();
        this.second = 0;
        this.minute = 0;
        this.hour = 0;
        this.seconds = 0;
        this.timeValue = '00:00';

        this.emit('change', this.timeValue);

        return this;
    }

    /**
     * 任务重启
     */
    restart() {
        this.stop();
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
}


export default Timer;
