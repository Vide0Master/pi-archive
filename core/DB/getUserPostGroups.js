const sysController = require('../systemController')

module.exports = (db, user) => {
    return new Promise(async resolve => {
        db.all(`SELECT * FROM posts_groups WHERE owner = ? ORDER BY id DESC`,
            [user],
            (err, rows) => {
                resolve(new sysController.createResponse(
                    's',
                    `{{S_DB_GPGS_S}} [${user}]`,
                    { groups: rows },
                    err,
                    `{{S_DB_GPGS_E}} [${user}]`
                ))
            })
    })
}