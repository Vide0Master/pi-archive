const SysController = require("../systemController")


module.exports = async (activeClients, userWS, sessionData, userData, requestData) => {
    const sendrslt = await SysController.dbinteract.createMessage({
        message: requestData.message,
        from: userData.login,
        to: requestData.to,
        msgtype: "DM"
    })
    if (sendrslt.rslt != 'e') {
        userWS.send(JSON.stringify(
            {
                type: "transmitMessage",
                target: sendrslt.message.to,
                data: { msg: sendrslt.message }
            }
        ))

        Object.values(activeClients).filter(client => client.login == requestData.to).forEach(client => {
            client.ws.send(JSON.stringify(
                {
                    type: "transmitMessage",
                    target: sendrslt.message.from,
                    data: { msg: sendrslt.message }
                }
            ))
        });
    }
}