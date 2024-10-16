const sysController = require('../systemController.js')

//экспорт функции
module.exports = (request, user_data) => {
    return new Promise(async resolve => {
        const messages = await sysController.dbinteract.getUserMessages(user_data.login)

        let info = { outUnread: 0, inUnread: 0, requiredAction: false }

        for (const msg of messages) {
            if (msg.read == 0 && msg.from == user_data.login) {
                info.outUnread++
            }
            if (msg.read == 0 && msg.to == user_data.login) {
                info.inUnread++
            }
            if (msg.msgtype.startsWith("ACTION")) {
                info.requiredAction = true
            }
        }

        resolve(info)
    })
}