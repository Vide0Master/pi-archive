const consoleLogger = require('../consoleLogger.js')

module.exports = (db) => {
    return new Promise(async resolve => {
        db.all(`SELECT * FROM users WHERE tgid != '0'`, (err, row) => {
            if (err) {
                resolve({ rslt: 'e', msg: err })
                consoleLogger(`e/Ошибка получения пользователtq по TGID: ${err}`)
            } else {
                resolve(row)
            }
        })
    })
}