const sysController = require('../systemController')

module.exports = (db, groupID, newGroupName) => {
    return new Promise(async resolve => {
        db.run(`UPDATE posts_groups SET 'name' = ? WHERE id = ?`,
            [newGroupName, groupID],
            (err) => {
                resolve(new sysController.createResponse(
                    's',
                    `{{S_DB_UGN_S}} ${newGroupName}`,
                    {},
                    err,
                    `{{S_DB_UGN_E}}`
                ))
            })
    })
}