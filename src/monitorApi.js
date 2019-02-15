const monitorApi = {
    // 监控业务API
    agentReadyM(thisDN, agentID) {
        let data = {"messageId":101,"thisDN":thisDN,"agentID":agentID};
        this.connection.send(data);
    },
    agentNotReadyM(thisDN, agentID, reasonCode) {
        let data = {"messageId":102,"thisDN":thisDN,"agentID":agentID,"reasonCode":reasonCode};
        this.connection.send(data);
    },
    agentLogoutM(thisDN, agentID) {
        let data = {"messageId":103,"thisDN":thisDN,"agentID":agentID};
        this.connection.send(data);
    },
    agentLoginM(thisDN, agentID) {
        let data = {"messageId":100,"thisDN":thisDN,"agentID":agentID};
        this.connection.send(data);
    }
};

export default monitorApi;
