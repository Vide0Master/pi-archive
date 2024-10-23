const sysController = require('../systemController')

module.exports = (db, postID, userKey) => {
    return new Promise(async resolve => {
        db.run(`UPDATE users SET avatarpostid = ? WHERE auth_key = ?`,
            [postID, userKey],
            (err) => {
                resolve(new sysController.createResponse(
                    's',
                    '{{S_DB_SUA_S}}',
                    {},
                    err,
                    '{{S_DB_SUA_E}}'
                ))
            })
    })
}