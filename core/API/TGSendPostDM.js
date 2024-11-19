const syscontroller = require('../systemController.js')

module.exports = (request, userData) => {
    return new Promise(async resolve => {
        const userSessions = (await syscontroller.dbinteract.getUserSessions(userData.login)).sessions
        const tgsessions = userSessions.filter(v => v.type == 'TGBOT')

        let msgrslt = false
        for (const tgsession of tgsessions) {
            msgrslt = await syscontroller.TGController.executeCommand('post', tgsession.key, null, userData, request.postID.toString(), request.isFile ? 'document' : null)
        }

        if (!msgrslt) {
            msgrslt = new syscontroller.createResponse(
                "w",
                "You are not authed in Telegram bot"
            )
        }
        resolve(msgrslt)
    })
}