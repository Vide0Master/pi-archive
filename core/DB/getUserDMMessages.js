const sysController = require('../systemController')

module.exports = (db, user) => {
    return new Promise(async resolve => {
        db.all(`SELECT * FROM messages WHERE "to" = ? OR "from" = ? AND "msgtype" = "DM" ORDER BY timestamp DESC`,
            [user, user],
            (err, rows) => {
                for(const row of rows){
                    row.specialdata = JSON.parse(row.specialdata)
                }
                resolve(new sysController.createResponse(
                    's',
                    'Got user messages',
                    {messages:rows},
                    err,
                    'Got user messages'
                ))
            })
    })
}