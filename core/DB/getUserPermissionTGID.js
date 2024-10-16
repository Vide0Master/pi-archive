const user_levels = require('../systemController').config.static.user_status

module.exports = (db, TGID) => {
    return new Promise(async resolve => {
        //запрос на БД для получения статуса пользователя
        const rslt = await new Promise((resolve) => {
            db.get(`SELECT * FROM users WHERE tgid = ?`,
                [TGID],
                (err, row) => {
                    if (err) {
                        resolve({ rslt: 'e', msg: err })
                    } else {
                        resolve(row)
                    }
                })
        })
        //если пользователя нету - уровень 0
        if (!rslt) {
            resolve(0)
            return
        }
        //проверка ошибки, иначе возврат уровня в соответствии с таблицей уровней с строки 6
        if (rslt.rslt == 'e') {
            consoleLogger(`e/Ошибка получения разрешений пользователя: ${rslt.msg}`)
            resolve('e')
        } else {
            resolve(user_levels[rslt.status])
        }
    })
}