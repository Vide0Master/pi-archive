const sysController = require('../systemController')

module.exports = (db, id) => {
    return new Promise(async resolve => {
        db.run(`DELETE FROM posts_groups WHERE id = ?`,
            [id],
            err => {
                resolve(new sysController.createResponse(
                    's',
                    `{{S_DB_DG_S}} ${id}`,
                    {},
                    err,
                    `{{S_DB_DG_E}} ${id}`
                ))
            })
    })
}