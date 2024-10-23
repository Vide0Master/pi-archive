const sysController = require('../systemController')

module.exports = (db, postID) => {
    return new Promise(async resolve => {
        db.all(`SELECT * FROM messages WHERE "to" = ? AND "msgtype" = "COMMENT" ORDER BY timestamp DESC`,
            [postID],
            (err, rows) => {
                resolve(new sysController.createResponse(
                    's',
                    `{{S_DB_GPC_S}} [${postID}]`,
                    { comments: rows },
                    err,
                    `{{S_DB_GPC_E}} [${postID}]`
                ))
            })
    })
}