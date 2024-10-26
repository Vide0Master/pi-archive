const sysController = require('../systemController')

module.exports = (db, groupname) => {
    return new Promise(async resolve => {
        db.run(`DELETE FROM tags_groups WHERE groupname = ?`,
            [groupname],
            err => {
                resolve(new sysController.createResponse(
                    's',
                    `Successfully deleted tag group "${groupname}"`,
                    {},
                    err,
                    `Successfully deleted tag group "${groupname}"`
                ))
            }
        )
    })
}