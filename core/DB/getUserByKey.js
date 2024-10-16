const consoleLogger = require('../consoleLogger.js')

module.exports = (db, key) => {
    return new Promise(async resolve => {
        db.get(`SELECT * FROM users WHERE auth_key = ?`,
            [key],
            (err, row) => {
                if (err) {
                    resolve({ rslt: 'e', msg: err })
                    consoleLogger(`e/Ошибка получения пользователя по ключу: ${err}`)
                } else {
                    resolve(row)
                }
            })
    })
}