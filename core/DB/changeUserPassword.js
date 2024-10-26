const SysController = require("../systemController")

module.exports = (db, login, newPassword) => {
    return new Promise(async resolve => {
        db.run(`UPDATE users SET password = ? WHERE login = ?`,
            [SysController.hashString(newPassword), login],
            (err) => {
                resolve(new SysController.createResponse(
                    's',
                    'Password changed',
                    {},
                    err,
                    `Error while changing password`
                ))
            })
    })
}