const sysController = require('../systemController')

module.exports = (db, userRQ, userK) => {
    return new Promise(async resolve => {
        db.all(`SELECT * FROM messages WHERE ("to" = ? AND "from" = ?) OR ("to" = ? AND "from" = ?) AND "msgtype" = "DM" ORDER BY timestamp DESC`,
            [userRQ, userK, userK, userRQ],
            (err, rows) => {
                resolve(new sysController.createResponse(
                    's',
                    `{{S_DB_GUDMM_S}} ${userRQ}`,
                    {messages:rows},
                    err,
                    `{{S_DB_GUDMM_E}} ${userRQ}`
                ))
            })
    })
}