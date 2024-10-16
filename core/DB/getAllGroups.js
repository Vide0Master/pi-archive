const sysController = require('../systemController')

module.exports = (db) => {
    return new Promise(async resolve => {
        db.all(`SELECT * FROM posts_groups`, (err, rows) => {
            for (const row of rows) {
                row.group = JSON.parse(row.group)
            }
            resolve(new sysController.createResponse(
                's',
                `Успешно получены все группы`,
                { groups: rows },
                err,
                `Ошибка получения всех групп`
            ))
        })
    })
}