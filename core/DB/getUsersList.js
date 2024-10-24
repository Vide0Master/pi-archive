const sysController = require('../systemController')

module.exports = (db) => {
    return new Promise(async resolve => {
        db.all(`SELECT login FROM users`, [], (err, rows) => {
            const users = []
            for (const usr of rows) {
                users.push(usr.login)
            }
            resolve(new sysController.createResponse(
                's',
                `Got users list`,
                { users },
                err,
                `Error getting users`
            ))
        })
    })
}