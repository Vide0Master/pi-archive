const SysController = require("../systemController")


module.exports = (db, login, status) => {
    return new Promise(async resolve => {
        db.run(`UPDATE users SET status = ? WHERE login = ?`,
            [status, login],
            (err) => {
                resolve(new SysController.createResponse(
                    's',
                    `{{S_DB_UST_S}} ${login}`,
                    {},
                    err,
                    '{{S_DB_UST_E}}'
                ))
            })
    })
}