const SysController = require("../systemController.js")

module.exports = (db, messageID) => {
    return new Promise(async resolve => {
        db.run(`DELETE FROM messages WHERE messageid = ?`,
            [messageID],
            (err) => {
                resolve(new SysController.createResponse(
                    's',
                    `Removed message ID:[${messageID}]`,
                    {},
                    err,
                    `Error while deleting message ID:[${messageID}]`
                ))
            })
    })
}