const sysController = require('../systemController')

module.exports = (db, userRQ, userK) => {
    return new Promise(async resolve => {
        db.all(`SELECT * FROM messages WHERE ("to" = ? AND "from" = ?) OR ("to" = ? AND "from" = ?) AND "msgtype" = "DM" ORDER BY timestamp DESC`,
            [userRQ, userK, userK, userRQ],
            (err, rows) => {
                resolve(new sysController.createResponse(
                    's',
                    `Got DM messages of ${userRQ}`,
                    {messages:rows},
                    err,
                    `Error getting DM messages of ${userRQ}`
                ))
            })
    })
}