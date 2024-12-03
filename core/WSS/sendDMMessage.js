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


        const user = activeClients[sendrslt.message.to]
        user.send(
            "transmitMessage",
            sendrslt.message.from,
            { msg: sendrslt.message }
        )
    }
}