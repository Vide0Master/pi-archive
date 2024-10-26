const sysController = require('../systemController')

module.exports = (db, postGroupID, data) => {
    return new Promise(async resolve => {
        db.run(`UPDATE posts_groups SET 'group' = ? WHERE id = ?`,
            [JSON.stringify(data), postGroupID],
            err => {
                resolve(new sysController.createResponse(
                    's',
                    `Updated posts group ID:${postGroupID}`,
                    {},
                    err,
                    `Updated posts group ID:${postGroupID}`
                ))
            })
    })
}