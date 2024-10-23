const sysController = require('../systemController')

module.exports = (db, likes, userLogin) => {
    return new Promise(async resolve => {
        db.run(`UPDATE users SET 'favs' = ? WHERE login = ?`,
            [JSON.stringify(likes), userLogin],
            (err) => {
                resolve(new sysController.createResponse(
                    's',
                    `{{S_DB_UUF_S}} ${userLogin}`,
                    {},
                    err,
                    `{{S_DB_UUF_E}} ${userLogin}`
                ))
            })
    })
}