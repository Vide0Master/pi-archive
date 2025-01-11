const SysController = require("../systemController.js")

module.exports = (db) => {
    return new Promise(async resolve => {
        db.all(`SELECT * FROM messages WHERE "to" = "SYSTEM"`, (err, rows) => {
            resolve(new SysController.createResponse(
                's',
                'Got admin requests',
                { requests: rows },
                err,
                'Error while getting admin requests'
            ))
        })
    })
}