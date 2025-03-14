const SysController = require('../systemController')

const consoleLogger = require('../systemController').log

module.exports = (db, postID) => {
    return new Promise(async resolve => {
        db.run(`DELETE FROM posts WHERE id = ?`,
            [postID],
            (err) => {
                resolve(new SysController.createResponse(
                    's',
                    `Deleted post ${postID}`,
                    {},
                    err,
                    `Error deleting post ${postID}`
                ))
            }
        )
    })
}