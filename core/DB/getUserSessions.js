const sysController = require('../systemController')

module.exports = (db, login) => {
    return new Promise(async resolve => {
        db.all(`SELECT * FROM sessions WHERE login = ?`, [login], (err, rows) => {
            resolve(new sysController.createResponse(
                's',
                `Got ${login} sessions`,
                { sessions: rows },
                err,
                `Error getting ${login} sessions`
            ))
        })
    })
}