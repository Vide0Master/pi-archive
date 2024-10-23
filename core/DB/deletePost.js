const SysController = require('../systemController')

const consoleLogger = require('../systemController').log

module.exports = (db, postID) => {
    return new Promise(async resolve => {
        db.run(`DELETE FROM posts WHERE id = ?`,
            [postID],
            (err) => {
                resolve(new SysController.createResponse(
                    's',
                    `{{S_DB_DP_S}} ${postID}`,
                    {},
                    err,
                    `{{S_DB_DP_E}} ${postID}`
                ))
            }
        )
    })
}