const SysController = require("../systemController")

module.exports = async (activeClients, userWS, userData, requestData) => {
    const readrslt = await SysController.dbinteract.updateMessageReadStatus(requestData.id, requestData.status)
    if (readrslt.rslt == 's') {
        if (!!activeClients[requestData.user]) {
            activeClients[requestData.user].send(
                'messageReadStatus',
                requestData.id,
                { status: requestData.status }
            )
            const msgCountForReciever = await require('../API/controlUserDM')({ type: 'getUserMessagesCount' }, { login: userData.login })
            activeClients[requestData.user].send(
                'messageCountUpdate',
                '',
                { count: msgCountForReciever }
            )
        }

        const msgCountForRequester = await require('../API/controlUserDM')({ type: 'getUserMessagesCount' }, userData)
        activeClients[userData.login].send(
            'messageCountUpdate',
            '',
            { count: msgCountForRequester }
        )
        activeClients[userData.login].send(
            'messageReadStatus',
            requestData.id,
            { status: requestData.status }
        )
    }
}