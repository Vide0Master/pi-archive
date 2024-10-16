const sysController = require('../systemController')

module.exports = (db, user) => {
    return new Promise(async resolve => {
        db.all(`SELECT * FROM posts_groups WHERE owner = ? ORDER BY id DESC`,
            [user],
            (err, rows) => {
                resolve(new sysController.createResponse(
                    's',
                    `Успешно получены группы постов пользователя [${user}]`,
                    { groups: rows },
                    err,
                    `Ошибка получения групп постов пользователя [${user}]`
                ))
            })
    })
}