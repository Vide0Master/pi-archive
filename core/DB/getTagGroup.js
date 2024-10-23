const sysController = require('../systemController')

module.exports = (db, name) => {
    return new Promise(async resolve => {
        db.get(`SELECT * FROM tags_groups WHERE groupname = ?`,
            [name],
            (err, row) => {
                if (row) {
                    row.relatedtags = JSON.parse(row.relatedtags)

                    resolve(new sysController.createResponse(
                        's',
                        `{{S_DB_GTG_S}}`,
                        { group: row },
                        err,
                        `{{S_DB_GTG_e}}`
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