/**
 * 坐席把状态至于NotReady的原因
 */
export const NotReadyReason = {
    /*未知*/
    UNKNOWN: -1,
    /*整理中*/
    NEATENING: 0,
    /*通话中*/
    TALKING: 1,
    /*未注册,话机不可用*/
    DEVICE_UNAVAILABLE: 2,
    /*示忙*/
    BUSY: 3,
    /*暂时离开*/
    WALK_AWAY: 4,
    /*休息中*/
    RESTING: 5,
    /*振铃*/
    RINGING: 6
};
