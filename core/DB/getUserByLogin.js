
const SysController = require('../systemController.js')

module.exports = (db, login) => {
    return new Promise(async resolve => {
        db.get(`SELECT * FROM users WHERE login = ?`,
            [login],
            (err, row) => {
                if (!row) {
                    resolve(new SysController.createResponse(
                        'e',
                        `Такого пользователя нету`,
                    ))
                } else {
                    resolve(new SysController.createResponse(
                        's',
                        `Получен пользователь [${row.login}] при помощи логина`,
                        { user: row },
                        err,
                        `Ошибка получения пользователя по лоигну [${login}]`
                    ))
                }
            })
    })
}