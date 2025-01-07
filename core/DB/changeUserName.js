const SysController = require("../systemController")

module.exports = (db, login, newName) => {
    return new Promise(async resolve => {
        db.run(`UPDATE users SET username = ? WHERE login = ?`,
            [newName, login],
            (err) => {
                resolve(new SysController.createResponse(
                    's',
                    'Username changed!',
                    {},
                    err,
                    'Error while changing username'
                ))
            })
    })
}