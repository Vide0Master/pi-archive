const SysController = require("../systemController")

module.exports = (db, userKey, newPassword) => {
    return new Promise(async resolve => {
        db.run(`UPDATE users SET password = ? WHERE auth_key = ?`,
            [newPassword, userKey],
            (err) => {
                resolve(new SysController.createResponse(
                    's',
                    'Пароль успешно изменён',
                    {},
                    err,
                    `Ошибка смены пароля`
                ))
            })
    })
}