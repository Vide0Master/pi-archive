const SysController = require("../systemController.js")

module.exports = (db, messageID, status) => {
    return new Promise(async resolve => {
        db.run(`UPDATE messages SET 'read' = ? WHERE messageid = ?`,
            [status, messageID],
            (err) => {
                resolve(new SysController.createResponse(
                    's',
                    `Marked as ${status == 0 ? "not read" : "read"}!`,
                    {},
                    err,
                    `Error setting message read status [${messageID}]:`
                ))
            })
    })
}