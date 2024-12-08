const SysController = require("../systemController")


module.exports = async (activeClients, userWS, userData, requestData) => {
    const sendrslt = await SysController.dbinteract.createMessage({
        message: requestData.message,
        from: userData.login,
        to: requestData.to,
        msgtype: "DM"
    })
    if (sendrslt.rslt != 'e') {
        activeClients[sendrslt.message.from].send(
            "transmitMessage",
            sendrslt.message.to,
            { msg: sendrslt.message }
        )


        const user = activeClients[sendrslt.message.to]
        if (!!user) {
            user.send(
                "transmitMessage",
                sendrslt.message.from,
                { msg: sendrslt.message }
            )
            const msgCountForReciever = await require('../API/controlUserDM')({ type: 'getUserMessagesCount' }, { login: sendrslt.message.to })
            user.send(
                'messageCountUpdate',
                '',
                { count: msgCountForReciever }
            )
        }
    }
}