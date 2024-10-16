const SysController = require("../systemController")

module.exports = (db, userKey, newName) => {
    return new Promise(async resolve => {
        db.run(`UPDATE users SET username = ? WHERE auth_key = ?`,
            [newName, userKey],
            (err) => {
                resolve(new SysController.createResponse(
                    's',
                    'Имя пользователя успешно изменено!',
                    {},
                    err,
                    'Ошибка изменения имени пользователя'
                ))
            })
    })
}