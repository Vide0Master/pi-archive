const sysController = require('../systemController')

module.exports = (db, id) => {
    return new Promise(async resolve => {
        db.get(`SELECT * FROM tags_groups WHERE id = ?`,
            [id],
            (err, row) => {
                if (row) {
                    row.relatedtags = JSON.parse(row.relatedtags)

                    try {
                        row.groupname = JSON.parse(row.groupname)
                    } catch { }

                    resolve(new sysController.createResponse(
                        's',
                        `Got tag groups`,
                        { group: row },
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