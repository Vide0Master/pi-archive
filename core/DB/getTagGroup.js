const sysController = require('../systemController')

module.exports = (db, name) => {
    return new Promise(async resolve => {
        db.get(`SELECT * FROM tags_groups WHERE groupname = ?`,
            [name],
            (err, row) => {
                if (row) {
                    row.relatedtags = JSON.parse(row.relatedtags)

                    resolve(new sysController.createResponse(
                        's',
                        `Успешно получены группы тегов`,
                        { group: row },
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