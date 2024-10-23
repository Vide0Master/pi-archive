const sysController = require('../systemController')

module.exports = (db) => {
    return new Promise(async resolve => {
        db.all(`SELECT * FROM tags_groups`, (err, rows) => {
            if (rows) {
                for (const row of rows) {
                    row.relatedtags = JSON.parse(row.relatedtags)
                }

                resolve(new sysController.createResponse(
                    's',
                    `{{S_DB_GTG_S}}`,
                    { groups: rows },
                    err,
                    `{{S_DB_GTG_E}}`
                ))
            } else {
                resolve(new sysController.createResponse(
                    'w',
                    `{{S_DB_GTG_NG}}`
                ))
            }
        })
    })
}