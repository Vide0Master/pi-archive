const sysController = require('../systemController')

module.exports = (db, type, key) => {
    return new Promise(async resolve => {
        db.run(`DELETE FROM sessions WHERE type = ? AND key = ?`, [type, key], (err) => {
            resolve(new sysController.createResponse(
                's',
                `Removed session`,
                {},
                err,
                `Error removing session`
            ))
        })
    })
}