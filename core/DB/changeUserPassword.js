const SysController = require("../systemController")

module.exports = (db, userKey, newPassword) => {
    return new Promise(async resolve => {
        db.run(`UPDATE users SET password = ? WHERE auth_key = ?`,
            [newPassword, userKey],
            (err) => {
                resolve(new SysController.createResponse(
                    's',
                    '{{S_DB_CUP_S}}',
                    {},
                    err,
                    `{{S_DB_CUP_E}}`
                ))
            })
    })
}