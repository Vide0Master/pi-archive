const SysController = require("../systemController.js")

module.exports = (db, messageID) => {
    return new Promise(async resolve => {
        db.run(`DELETE FROM messages WHERE messageid = ?`,
            [messageID],
            (err) => {
                resolve(new SysController.createResponse(
                    's',
                    `{{S_DB_RMM_S}} ID:[${messageID}]`,
                    {},
                    err,
                    `{{S_DB_RMM_E}} ID:[${messageID}]`
                ))
            })
    })
}