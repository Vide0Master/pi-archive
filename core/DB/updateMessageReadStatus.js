const SysController = require("../systemController.js")

module.exports = (db, messageID, status) => {
    return new Promise(async resolve => {
        db.run(`UPDATE messages SET 'read' = ? WHERE messageid = ?`,
            [status, messageID],
            (err) => {
                resolve(new SysController.createResponse(
                    's',
                    `Успешно отмечено как ${status == 0 ? "не прочитано" : "прочитано"}!`,
                    {},
                    err,
                    `Ошибка отметки статуса сообщения [${messageID}]:`
                ))
            })
    })
}