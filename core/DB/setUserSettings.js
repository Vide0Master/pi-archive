const sysController = require('../systemController')

module.exports = (db, login, data) => {
    return new Promise(async resolve => {
        db.run(`UPDATE users SET usersettings = ? WHERE login = ?`,
            [JSON.stringify(data), login],
            (err) => {
                resolve(new sysController.createResponse(
                    's',
                    'Changed user settings',
                    {},
                    err,
                    'Error changing user settings'
                ))
            })
    })
}