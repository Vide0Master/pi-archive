
const SysController = require('../systemController.js')

module.exports = (db, login, key) => {
    return new Promise(async resolve => {
        db.run(`UPDATE users SET auth_key = ? WHERE login = ?`,
            [key, login],
            (err) => {
                resolve(new SysController.createResponse(
                    's',
                    `Успешно обновлен ключ пользователя [${login}]`,
                    {},
                    err,
                    'Ошибка обновления ключа пользователя'
                ))
            })
    })
}