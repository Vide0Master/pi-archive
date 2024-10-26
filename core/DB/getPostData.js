const sysController = require('../systemController')

module.exports = (db, postID) => {
    return new Promise(async resolve => {
        db.get(`SELECT * FROM posts WHERE id = ?`,
            [postID],
            (err, row) => {
                resolve(new sysController.createResponse(
                    's',
                    `Got data of post ${postID}`,
                    { post: row },
                    err,
                    `Error while retrieving data of post ${postID}`
                ))
            })
    })
}