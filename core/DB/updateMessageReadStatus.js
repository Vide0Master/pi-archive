const SysController = require("../systemController.js")

module.exports = (db, messageID, status) => {
    return new Promise(async resolve => {
        db.run(`UPDATE messages SET 'read' = ? WHERE messageid = ?`,
            [status, messageID],
            (err) => {
                resolve(new SysController.createResponse(
                    's',
                    `{{S_DB_UMRS_M_SM}} ${status == 0 ? "{{S_DB_UMRS_M_U}}" : "{{S_DB_UMRS_M_R}}"}!`,
                    {},
                    err,
                    `{{S_DB_UMRS_E}} [${messageID}]:`
                ))
            })
    })
}