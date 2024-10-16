const consoleLogger = require('../consoleLogger.js')

module.exports = (db, TGID) => {
    return new Promise(async resolve => {
        db.get(`SELECT * FROM users WHERE tgid = ?`,
            [TGID],
            (err, row) => {
                if (err) {
                    resolve({ rslt: 'e', msg: err })
                    consoleLogger(`e/Ошибка получения пользователя по TGID: ${err}`)
                } else {
                    resolve(row)
                }
            })
    })
}