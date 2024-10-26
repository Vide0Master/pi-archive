
const SysController = require('../systemController.js')

module.exports = (db, login) => {
    return new Promise(async resolve => {
        db.get(`SELECT * FROM users WHERE login = ?`,
            [login],
            (err, row) => {
                if (!row) {
                    resolve(new SysController.createResponse(
                        'e',
                        `No such user`,
                    ))
                } else {
                    resolve(new SysController.createResponse(
                        's',
                        `Got user ${row.login} by login`,
                        { user: row },
                        err,
                        `Error getting user by login ${login}`
                    ))
                }
            })
    })
}