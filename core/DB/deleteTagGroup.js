const sysController = require('../systemController')

module.exports = (db, groupname) => {
    return new Promise(async resolve => {
        db.run(`DELETE FROM tags_groups WHERE groupname = ?`,
            [groupname],
            err => {
                resolve(new sysController.createResponse(
                    's',
                    `{{S_DB_DTG_S}} "${groupname}"`,
                    {},
                    err,
                    `{{S_DB_DTG_S}} "${groupname}"`
                ))
            }
        )
    })
}