const sysController = require('../systemController')

module.exports = (db, postID, desc) => {
    return new Promise(async resolve => {
        db.run(`UPDATE posts SET 'description' = ? WHERE id = ?`,
            [desc, postID],
            (err) => {
                resolve(new sysController.createResponse(
                    's',
                    `Описание обновлено`,
                    {},
                    err,
                    `Ошибка обновления описания`
                ))
            })
    })
}