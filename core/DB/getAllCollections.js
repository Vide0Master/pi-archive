const sysController = require('../systemController')

module.exports = (db) => {
    return new Promise(async resolve => {
        db.all(`SELECT * FROM posts_groups WHERE "type" = "collection"`, (err, rows) => {
            if(!err){
                for (const row of rows) {
                    row.group = JSON.parse(row.group)
                }
            }
            resolve(new sysController.createResponse(
                's',
                `Got all collections`,
                { collections: rows },
                err,
                `Error while getting collections`
            ))
        })
    })
}