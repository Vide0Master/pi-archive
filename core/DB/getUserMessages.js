const sysController = require('../systemController')

module.exports = (db, user) => {
    return new Promise(async resolve => {
        db.all(`SELECT * FROM messages WHERE "to" = ? OR "from" = ? AND "msgtype" = "DM" ORDER BY timestamp DESC`,
            [user, user],
            (err, rows) => {
                if (err) {
                    sysController.log(`e/Ошибка получения сообщений [getUserMessages]: ${err}`)
                    resolve({ rslt: 'e', msg: err })
                } else {
                    resolve(rows)
                }
            })
    })
}