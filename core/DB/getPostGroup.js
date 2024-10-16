const sysController = require('../systemController')

module.exports = (db, postID) => {
    return new Promise(async resolve => {
        db.get(`SELECT * FROM posts_groups WHERE "group" LIKE ?`,
            [`%"` + postID + `"%`],
            (err, row) => {
                const data = !!row ? { id: row.id, group: JSON.parse(row.group).map(value => parseInt(value)), name: row.name, type: row.type } : null

                resolve(new sysController.createResponse(
                    's',
                    `Получена информация о группе поста [${postID}]`,
                    { data },
                    err,
                    `Ошибка получения группы поста [${postID}]`
                ))
            })
    })
}