const sysController = require('../systemController')

module.exports = (db, groupname) => {
    return new Promise(async resolve => {
        db.run(`INSERT INTO tags_groups ('groupname')
            VALUES (?)`,
            [groupname],
            err => {
                resolve(new sysController.createResponse(
                    's',
                    `{{S_DB_CRTG_S}} "${groupname}"`,
                    {},
                    err,
                    `{{S_DB_CRTG_S}} "${groupname}"`
                ))
            })
    })
}