
const SysController = require('../systemController')

module.exports = (db, postID, tags) => {
    return new Promise(async resolve => {
        db.run(`UPDATE posts SET tags = ? WHERE id = ?`,
            [JSON.stringify(tags), postID],
            (err) => {
                resolve(new SysController.createResponse(
                    's',
                    `Updated tags for post ${postID}`,
                    {},
                    err,
                    `Error updating tags for post ${postID}`
                ))
            }
        )
    })
}