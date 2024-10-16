const sysController = require('../systemController')

module.exports = (db, groupID, newGroupName) => {
    return new Promise(async resolve => {
        db.run(`UPDATE posts_groups SET 'name' = ? WHERE id = ?`,
            [newGroupName, groupID],
            (err) => {
                resolve(new sysController.createResponse(
                    's',
                    `Успешно изменено имя группы`,
                    {},
                    err,
                    `Ошибка изменения имени группы`
                ))
            })
    })
}