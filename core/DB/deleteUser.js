const sysController = require('../systemController')

module.exports = (db, login) => {
    return new Promise(async resolve => {
        db.run(`DELETE FROM users WHERE login = ?`,
            [login],
            (err) => {
                resolve(new sysController.createResponse(
                    's',
                    `User [${login}] deleted`,
                    {},
                    err,
                    `Error deleting user ${login}`
                ))
            })
    })
}