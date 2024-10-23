const sysController = require('../systemController')

module.exports = (db, user) => {
    return new Promise(async resolve => {
        db.all(`SELECT * FROM messages WHERE "to" = ? OR "from" = ? AND "msgtype" = "DM" ORDER BY timestamp DESC`,
            [user, user],
            (err, rows) => {
                resolve(new sysController.createResponse(
                    's',
                    '{{S_DB_GUM_S}}',
                    {messages:rows},
                    err,
                    '{{S_DB_GUM_S}}'
                ))
            })
    })
}