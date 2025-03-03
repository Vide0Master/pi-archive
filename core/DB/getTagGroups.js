const sysController = require('../systemController')

module.exports = (db) => {
    return new Promise(async resolve => {
        db.all(`SELECT * FROM tags_groups`, (err, rows) => {
            if (rows) {
                for (const row of rows) {
                    row.relatedtags = JSON.parse(row.relatedtags)

                    try {
                        row.groupname = JSON.parse(row.groupname)
                    } catch { }
                }

                resolve(new sysController.createResponse(
                    's',
                    `Got tag groups`,
                    { groups: rows },
                    err,
                    `Error getting tag groups`
                ))
            } else {
                resolve(new sysController.createResponse(
                    'w',
                    `No tag groups`
                ))
            }
        })
    })
}