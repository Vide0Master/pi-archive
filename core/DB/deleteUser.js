const sysController = require('../systemController')

module.exports = (db, login) => {
    return new Promise(async resolve => {
        db.run(`DELETE FROM users WHERE login = ?`,
            [login],
            (err) => {
                resolve(new sysController.createResponse(
                    's',
                    `{{S_DB_DUSR_S_F}} [${login}] {{S_DB_DUSR_S_S}}`,
                    {},
                    err,
                    `{{S_DB_DUSR_E}} ${login}`
                ))
            })
    })
}