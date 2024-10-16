const SysController = require("../systemController")


module.exports = (db, login, status) => {
    return new Promise(async resolve => {
        db.run(`UPDATE users SET status = ? WHERE login = ?`,
            [status, login],
            (err) => {
                resolve(new SysController.createResponse(
                    's',
                    `Успешно обновлен статус [${login}]`,
                    {},
                    err,
                    'Ошибка обновления статуса пользователя'
                ))
            })
    })
}