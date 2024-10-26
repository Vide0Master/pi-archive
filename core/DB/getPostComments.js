const sysController = require('../systemController')

module.exports = (db, postID) => {
    return new Promise(async resolve => {
        db.all(`SELECT * FROM messages WHERE "to" = ? AND "msgtype" = "COMMENT" ORDER BY timestamp DESC`,
            [postID],
            (err, rows) => {
                resolve(new sysController.createResponse(
                    's',
                    `Got comments of post [${postID}]`,
                    { comments: rows },
                    err,
                    `Error getting comments of post  [${postID}]`
                ))
            })
    })
}