const sysController = require('../systemController')

module.exports = (db, postID) => {
    return new Promise(async resolve => {
        db.get(`SELECT * FROM posts WHERE id = ?`,
            [postID],
            (err, row) => {
                resolve(new sysController.createResponse(
                    's',
                    `{{S_DB_GPD_S}} ${postID}`,
                    { post: row },
                    err,
                    `{{S_DB_GPD_E}} ${postID}`
                ))
            })
    })
}