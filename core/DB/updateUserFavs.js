const sysController = require('../systemController')

module.exports = (db, likes, userLogin) => {
    return new Promise(async resolve => {
        db.run(`UPDATE users SET 'favs' = ? WHERE login = ?`,
            [JSON.stringify(likes), userLogin],
            (err) => {
                resolve(new sysController.createResponse(
                    's',
                    `Обновлен список дизлайков ${userLogin}`,
                    {},
                    err,
                    `Ошибка обновления дизлайков ${userLogin}`
                ))
            })
    })
}