
/**
 * 表示电话的方向
 */
const CallType = {
    /*未知类型:电话方向未知，一般是程序出错导致*/
    UNKNOWN: 0,
    /*内部电话*/
    INTERNAL: 1,
    /*客户呼入:外部客户来电*/
    INBOUND: 2,
    /*手动呼出:坐席外拨去电*/
    OUTBOUND: 3,
    /*电话转接:坐席内部咨询电话*/
    CONSULT: 4,
    /*多方通话*/
    THREEWAY: 5,
    /*预约回呼*/
    ORDERCALLBACK: 6,
    /*电话回访*/
    MANUALCALLBACK: 7,
    /*预测外呼*/
    PREDICT: 8,
    /*精确预览:预览外呼*/
    PREVIEW: 9,
    /*网页电话:预留*/
    WEBCALL: 10,
    /*电话监听*/
    MONITOR: 11,
};
/* 状态字典 */
CallType.dict = {
    [CallType.UNKNOWN]: '未知类型',
    [CallType.INTERNAL]: '内部通话',
    [CallType.INBOUND]: '客户呼入',
    [CallType.OUTBOUND]: '手动呼出',
    [CallType.CONSULT]: '电话转接',
    [CallType.THREEWAY]: '多方通话',
    [CallType.ORDERCALLBACK]: '预约回呼',
    [CallType.MANUALCALLBACK]: '电话回访',
    [CallType.PREDICT]: '预测外呼',
    [CallType.PREVIEW]: '精确预览',
    [CallType.WEBCALL]: '网页电话',
    [CallType.MONITOR]: '电话监听',
};

export {CallType};
