const sysController = require('../systemController')

module.exports = (db, user) => {
    return new Promise(async resolve => {
        db.all(`SELECT * FROM posts_groups WHERE owner = ? ORDER BY id DESC`,
            [user],
            (err, rows) => {
                resolve(new sysController.createResponse(
                    's',
                    `Got post groups of [${user}]`,
                    { groups: rows },
                    err,
                    `Error getting post groups of [${user}]`
                ))
            })
    })
}