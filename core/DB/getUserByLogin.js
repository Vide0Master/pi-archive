
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
                    row.favs = JSON.parse(row.favs)
                    row.likes = JSON.parse(row.likes)
                    row.dislikes = JSON.parse(row.dislikes)
                    row.blacklist = JSON.parse(row.blacklist)
                    row.usersettings = JSON.parse(row.usersettings)
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