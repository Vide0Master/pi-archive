const sysController = require('../systemController')

module.exports = (db, userKey, TGID) => {
    return new Promise(async resolve => {
        db.run(`UPDATE users SET tgid = ? WHERE auth_key = ?`,
            [TGID, userKey],
            (err) => {
                if (err) {
                    resolve({ rslt: 'e', msg: err })
                    consoleLogger(`e/Ошибка ошибка установки TGID: ${err}`)
                } else {
                    resolve({ rslt: 's' })
                }
            })
    })
}