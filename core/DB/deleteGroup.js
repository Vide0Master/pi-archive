const sysController = require('../systemController')

module.exports = (db, id) => {
    return new Promise(async resolve => {
        db.run(`DELETE FROM posts_groups WHERE id = ?`,
            [id],
            err => {
                resolve(new sysController.createResponse(
                    's',
                    `Группа ID:${id} удалена`,
                    {},
                    err,
                    `Ошибка удаления группы ID:${id}`
                ))
            })
    })
}