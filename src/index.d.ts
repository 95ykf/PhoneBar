/// <reference lib="dom"/>

interface IObject<T = any> {
  [key: string]: T;
}

declare class PhoneBar {
  constructor(options: PhoneBar.Options);

  /**
   * 销毁组件
   *
   * @remarks
   * 删除页面上显示的电话条元素、绑定的事件和断开与CTI服务器的连接
   */
  destroy(): void;

  /**
   * 工具库
   */
  static utils: {
    /**
     * 提示消息
     * @param msg 消息内容
     *
     * 缺省插件以 alert 方式弹出，用户可以覆盖的弹窗方法。提示消息默认使用 alert
     */
    showMessage(msg: string): void;
    checkPhoneNumber(num: number | string): boolean;
    parseParam(param: IObject): string;
    isFunction(f: any): boolean;
    firstUpperCase(str: string): any;
    trim(str: string): any;
  };
}

declare namespace PhoneBar {
  interface Options {
    /**
     * 渲染容器
     *
     * @remarks
     * 页面元素id，渲染到置顶元素内，默认追加到body内。创建对象前需保证改dom对象已存在。
     */
    renderTo: string;

    /**
     * CTI 服务器地址
     */
    proxyUrl: string;

    /**
     * SIP服务地址
     */
    sipServerUrl?: string;

    /**
     * 是否自动启动软电话
     *
     * 如果自动启动请配置软电话服务地址
     */
    startupSoftPhone: boolean;

    /**
     * 租户ID
     */
    tid: string;

    /**
     * 分机号
     */
    thisDN: string;

    /**
     * PSTN号码 可以为null
     */
    pstnDN: string | null;

    /**
     * 坐席的工号 与分机号一致
     */
    agentID: string;

    /**
     * 密码
     */
    password: string;

    /**
     * 密码类型 默认不加密
     *
     * @remarks
     * 0 不加密;
     * 1 普通加密;
     * 2 随机码混淆加密;
     */
    loginType?: number;

    /**
     * 所在技能组
     *
     * @remarks
     * 格式如：[100018000,100018001] 或 [100019000]
     *
     * 当 defaultQueue = 1 时可以为空
     */
    thisQueues: string[];

    /**
     * 默认技能组
     *
     * @remarks
     * 默认值 "1" 不等于 "1" 时值必须是 thisQueues 数组中的其中一个
     */
    defaultQueue: string;

    /**
     * 通话后自动置闲
     *
     * @remarks
     * null 使用服务端配置 true 开启 false 关闭
     */
    autoIdleWhenAfterWork?: boolean | null;

    /**
     * 登录后自动置闲
     */
    autoIdleWhenLogin?: boolean;

    /**
     * 是否手机随行 即手机在线
     */
    isPhoneTakeAlong?: boolean;

    /**
     * 随行手机号
     */
    workPhone?: string;

    /**
     * 自动应答 软电话协议预留
     */
    autoAnswer?: boolean;

    /**
     * 坐席状态变更事件
     * @param newState 坐席当前状态值
     * @param beforeValue 变更前的状态值
     */
    onAgentStatusChange?(newState: string, beforeValue: string): void;

    /**
     * 弹屏事件
     * @param lineState 当前线路状态值
     * @param callInfo 通话信息
     */
    onScreenPopup?(lineState: string, callInfo: IObject): void;

    /**
     * 振铃事件
     * @param callInfo 通话信息
     */
    onRinging?(callInfo: IObject): void;

    /**
     * 接通事件
     * @param callInfo 通话信息
     */
    onTalking?(callInfo: IObject): void;

    /**
     * 挂机事件
     * @param callInfo 通话信息
     */
    onHangup?(callInfo: IObject): void;

    /**
     * 连接被服务器断开事件
     * @param callInfo 通话信息
     */
    onLinkDisconnected?(callInfo: IObject): void;
  }
}

declare class Log {
  /**
   * 基础日志
   * @param message 日志消息
   * @param args
   */
  static log(message: string, ...args: string[]): void;

  /**
   * 信息日志
   * @param message 日志消息
   * @param args
   */
  static info(message: string, ...args: string[]): void;

  /**
   * 错误日志
   * @param message 日志消息
   * @param args
   */
  static error(message: string, ...args: string[]): void;
}

export = PhoneBar;

// export as namespace PhoneBar;
