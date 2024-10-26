const sysController = require('../systemController')

module.exports = (db, groupname) => {
    return new Promise(async resolve => {
        db.run(`INSERT INTO tags_groups ('groupname')
            VALUES (?)`,
            [groupname],
            err => {
                resolve(new sysController.createResponse(
                    's',
                    `Created tag group "${groupname}"`,
                    {},
                    err,
                    `Created tag group "${groupname}"`
                ))
            })
    })
}