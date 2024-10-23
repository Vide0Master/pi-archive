const SysController = require("../systemController.js")



module.exports = (db) => {
    return new Promise(async resolve => {
        db.all(`SELECT * FROM messages WHERE "to" = "SYSTEM"`, (err, rows) => {
            resolve(new SysController.createResponse(
                's',
                '{{S_DB_GMAR_S}}',
                { requests: rows },
                err,
                '{{S_DB_GMAR_E}}'
            ))
        })
    })
}