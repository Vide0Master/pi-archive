const SysController = require('../systemController.js')

module.exports = (db, key) => {
    return new Promise(async resolve => {
        db.get(`SELECT * FROM users WHERE auth_key = ?`,
            [key],
            (err, row) => {
                if (err) {
                    resolve(new SysController.createResponse(
                        '',
                        '',
                        {},
                        err,
                        "Error getting user by user key"
                    ))
                } else {
                    if (row) {
                        row.favs = JSON.parse(row.favs)
                        row.likes = JSON.parse(row.likes)
                        row.dislikes = JSON.parse(row.dislikes)
                        row.blacklist = JSON.parse(row.blacklist)
                        row.usersettings = JSON.parse(row.usersettings)
                        resolve(new SysController.createResponse(
                            's',
                            `Got user ${row.login} by key`,
                            { user: row }
                        ))
                    } else {
                        resolve(new SysController.createResponse(
                            'e',
                            'No such user',
                            { user: null }
                        ))
                    }
                }
            })
    })
}