const sysController = require('../systemController')

module.exports = (db, userRQ, userK) => {
    return new Promise(async resolve => {
        db.all(`SELECT * FROM messages WHERE ("to" = ? AND "from" = ?) OR ("to" = ? AND "from" = ?) AND "msgtype" = "DM" ORDER BY timestamp DESC`,
            [userRQ, userK, userK, userRQ],
            (err, rows) => {
                resolve(new sysController.createResponse(
                    's',
                    'Успешно получены сообщения',
                    {messages:rows},
                    err,
                    'Ошибка получения списка сообщения:'
                ))
                if (err) {
                    sysController.log(`e/Ошибка получения сообщений [getUserDMMessages]: ${err}`)
                    resolve({ rslt: 'e', msg: err })
                } else {
                    resolve(rows)
                }
            })
    })
}