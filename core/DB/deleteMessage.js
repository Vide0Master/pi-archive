const SysController = require("../systemController.js")

module.exports = (db, messageID) => {
    return new Promise(async resolve => {
        db.run(`DELETE FROM messages WHERE messageid = ?`,
            [messageID],
            (err) => {
                resolve(new SysController.createResponse(
                    's',
                    `Удалено сообщение ID:[${messageID}]`,
                    {},
                    err,
                    `Ошибка удаления сообщения [ID${messageID}][delteMessage]`
                ))
            })
    })
}