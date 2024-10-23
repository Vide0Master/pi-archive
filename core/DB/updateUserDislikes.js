const sysController = require('../systemController')

module.exports = (db, likes, userLogin) => {
    return new Promise(async resolve => {
        db.run(`UPDATE users SET 'dislikes' = ? WHERE login = ?`,
            [JSON.stringify(likes), userLogin],
            (err) => {
                resolve(new sysController.createResponse(
                    's',
                    `{{S_DB_UUD_S}} ${userLogin}`,
                    {},
                    err,
                    `{{S_DB_UUD_E}} ${userLogin}`
                ))
            })
    })
}