const sysController = require('../systemController')

module.exports = (db, id) => {
    return new Promise(async resolve => {
        db.get(`SELECT * FROM posts_groups WHERE id = ?`,
            [id],
            (err, row) => {
                if (!row) {
                    resolve(new sysController.createResponse(
                        'e',
                        `Группы постов ID:${id} нету в базе данных!`,
                    ))
                } else {
                    row.group = JSON.parse(row.group)
                    resolve(new sysController.createResponse(
                        's',
                        `Успешно получена группа постов по ID:${id}`,
                        { group: row },
                        err,
                        `Ошибка получения группы постов по ID:${id}`
                    ))
                }
            })
    })
}