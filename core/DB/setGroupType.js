const sysController = require('../systemController')

module.exports = (db, groupID, newType) => {
    return new Promise(async resolve => {
        db.run(`UPDATE posts_groups SET type = ? WHERE id = ?`,
            [newType, groupID],
            (err) => {
                resolve(new sysController.createResponse(
                    's',
                    '{{S_DB_SGT_S}}',
                    {},
                    err,
                    '{{S_DB_SGT_e}}'
                ))
            })
    })
}