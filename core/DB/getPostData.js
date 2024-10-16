const sysController = require('../systemController')

module.exports = (db, postID) => {
    return new Promise(async resolve => {
        db.get(`SELECT * FROM posts WHERE id = ?`,
            [postID],
            (err, row) => {
                resolve(new sysController.createResponse(
                    's',
                    `Успешно получены данные поста ${postID}`,
                    { post: row },
                    err,
                    `Ошибка получены данных поста ${postID}`
                ))
            })
    })
}