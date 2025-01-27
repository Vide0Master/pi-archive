const sysController = require('../systemController')

module.exports = (db) => {
    return new Promise(async resolve => {
        db.all(`SELECT * FROM posts_groups ORDER BY id DESC`, (err, rows) => {
            for (const row of rows) {
                row.group = JSON.parse(row.group)
            }
            resolve(new sysController.createResponse(
                's',
                `Got all groups`,
                { groups: rows },
                err,
                `Error getting groups`
            ))
        })
    })
}