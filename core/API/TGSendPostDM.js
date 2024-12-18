const syscontroller = require('../systemController.js')

module.exports = (request, userData) => {
    return new Promise(async resolve => {
        const userSessions = (await syscontroller.dbinteract.getUserSessions(userData.login)).sessions
        const tgsessions = userSessions.filter(v => v.type == 'TGBOT')

        let msgrslt = 0
        for (const tgsession of tgsessions) {
            const latConfirm = await syscontroller.dbinteract.checkSessionLAT(tgsession.type, tgsession.key)
            if (latConfirm.valid) {
                const sendRslt = await syscontroller.TGController.executeCommand('post', tgsession.key, null, userData, request.postID.toString(), request.isFile ? 'document' : null)
                if (sendRslt.rslt == 's') {
                    msgrslt++
                }
            }
        }

        if (msgrslt == 0) {
            resolve(new syscontroller.createResponse(
                "w",
                "You are not authed in Telegram bot"
            ))
        } else {
            resolve(new syscontroller.createResponse(
                "s",
                `Sent post to ${msgrslt > 1 ? msgrslt + ' ' : ''}DM${msgrslt > 1 ? 's' : ''}`,
                { chats: msgrslt }
            ))
        }
    })
}