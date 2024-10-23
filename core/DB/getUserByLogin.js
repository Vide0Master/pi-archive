
const SysController = require('../systemController.js')

module.exports = (db, login) => {
    return new Promise(async resolve => {
        db.get(`SELECT * FROM users WHERE login = ?`,
            [login],
            (err, row) => {
                if (!row) {
                    resolve(new SysController.createResponse(
                        'e',
                        `{{S_DB_GUBL_NU}}`,
                    ))
                } else {
                    resolve(new SysController.createResponse(
                        's',
                        `{{S_DB_GUBL_S_F}} ${row.login} {{S_DB_GUBL_S_S}}`,
                        { user: row },
                        err,
                        `{{S_DB_GUBL_E}} ${login}`
                    ))
                }
            })
    })
}