const sysController = require('../systemController')

module.exports = (db) => {
    return new Promise(async resolve => {
        db.all(`SELECT * FROM tags_groups`, (err, rows) => {
            if (rows) {
                for (const row of rows) {
                    row.relatedtags = JSON.parse(row.relatedtags)
                }

                resolve(new sysController.createResponse(
                    's',
                    `Успешно получены группы тегов`,
                    { groups: rows },
                    err,
                    `Ошибка получения групп тегов`
                ))
            } else {
                resolve(new sysController.createResponse(
                    'w',
                    `Нету групп тегов`
                ))
            }
        })
    })
}