const sysController = require('../systemController')

module.exports = (db, likes, userLogin) => {
    return new Promise(async resolve => {
        db.run(`UPDATE users SET 'likes' = ? WHERE login = ?`,
            [JSON.stringify(likes), userLogin],
            (err) => {
                resolve(new sysController.createResponse(
                    's',
                    `Updated likes list of ${userLogin}`,
                    {},
                    err,
                    `Error updating likes list of ${userLogin}`
                ))
            })
    })
}