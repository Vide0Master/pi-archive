
const SysController = require('../systemController')

module.exports = (db, postID, tags) => {
    return new Promise(async resolve => {
        db.run(`UPDATE posts SET tags = ? WHERE id = ?`,
            [JSON.stringify(tags), postID],
            (err) => {
                resolve(new SysController.createResponse(
                    's',
                    `{{S_DB_UT_S}} ${postID}`,
                    {},
                    err,
                    `{{S_DB_UT_E}} ${postID}`
                ))
            }
        )
    })
}