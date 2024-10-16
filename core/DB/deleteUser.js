const sysController = require('../systemController')

module.exports = (db, login) => {
    return new Promise(async resolve => {
        db.run(`DELETE FROM users WHERE login = ?`,
            [login],
            (err) => {
                resolve(new sysController.createResponse(
                    's',
                    `Пользователь [${login}] удалён`,
                    {},
                    err,
                    `Ошибка удаления пользователя [${login}]`
                ))
            })
    })
}