const sysController = require('../systemController')

module.exports = (db, likes, userLogin) => {
    return new Promise(async resolve => {
        db.run(`UPDATE users SET 'dislikes' = ? WHERE login = ?`,
            [JSON.stringify(likes), userLogin],
            (err) => {
                resolve(new sysController.createResponse(
                    's',
                    `Updated dislikes list of ${userLogin}`,
                    {},
                    err,
                    `Error updating dislikes list of ${userLogin}`
                ))
            })
    })
}