const sysController = require('../systemController')

module.exports = (db, groupID, color) => {
    return new Promise(async resolve => {
        db.run(`UPDATE posts_groups SET color = ? WHERE id = ?`,
            [color, groupID],
            (err) => {
                resolve(new sysController.createResponse(
                    's',
                    'Changed group color',
                    {},
                    err,
                    '{{S_DB_SGT_e}}'
                ))
            })
    })
}