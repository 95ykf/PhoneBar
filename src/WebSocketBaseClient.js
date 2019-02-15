import EventEmitter from 'eventemitter3';
import ReconnectingWebSocket from './assets/js/reconnecting-websocket'

/**
 * websocket客户端基础类，用于子类继承
 */
class WebSocketBaseClient extends EventEmitter {

    constructor({
                    url = 'ws://127.0.0.1:57712', protocols = [],

                    automaticOpen = true,
                    keepAliveInterval = 20000,

                    debug = false
                } = {}) {
        super();
        this.url = url;
        this.protocols = protocols;

        /** 实例化后是否自动打开 */
        this.automaticOpen = automaticOpen;
        /** 心跳包时间间隔 */
        this.keepAliveInterval = keepAliveInterval;

        this.ws = null;
        this.status =

        this.debug = debug;

        if (this.automaticOpen) {
            this.open();
        }
    }

    /**
     * 浏览器是否支持WebSocket
     * @returns {boolean} 是否支持
     */
    static browserSupportsWebSockets() {
        return (window.WebSocket !== null && window.WebSocket !== undefined);
    }

    /**
     * 初始化
     */
    open() {
        if (!this.ws) {
            this.ws = new ReconnectingWebSocket(this.url, this.protocols);
            this.ws.onopen = (aEvent) => {
                this.onOpen(aEvent)
            };
            this.ws.onclose = (aEvent) => {
                this.onClose(aEvent)
            };
            this.ws.onmessage = (aEvent) => {
                this.onMessage(aEvent)
            };
            this.ws.onerror = (aEvent) => {
                this.onError(aEvent)
            };
        }
    }

    onOpen(aEvent) {
    }

    onClose(aEvent) {}

    onMessage(message) {}

    onError(aEvent) {
    }

    isOpened() {
        return (this.ws && this.ws.readyState === WebSocket.OPEN);
    }

    close() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    sendMessage(aToken) {
        if (this.ws) {
            return this.ws.send(JSON.stringify(aToken));
        } else {
            throw 'INVALID_STATE_ERR : Pausing to reconnect websocket';
        }

    }

    /**
     * 发送ping消息
     */
    ping() {
    }

    /**
     * 开始一个连接保持定时器
     */
    startKeepAlive(immediate = true) {
        // 如果有一个正在运行的定时器
        if (this.keepAliveTimeout) {
            this.stopKeepAlive();
        }
        // 如果没有open
        if (!this.isOpened()) {
            // TODO: 这里添加合理的返回结果
            return;
        }
        if (immediate) {
            // 如果立即执行，直接发送一次ping指令
            this.ping();
        }
        // 初始化一个定时器
        this.keepAliveTimeout = setInterval(() => {
                if (this.isOpened()) {
                    this.ping();
                } else {
                    this.stopKeepAlive();
                }
            },
            this.keepAliveInterval
        );
    }

    /**
     * 结束一个连接保持定时器
     */
    stopKeepAlive() {
        // TODO: 这里添加合理的返回结果
        if (this.keepAliveTimeout) {
            clearInterval(this.keepAliveTimeout);
            this.keepAliveTimeout = null;
        }
    }
}

export default WebSocketBaseClient;
