const sysController = require('../systemController')

module.exports = (db, likes, userLogin) => {
    return new Promise(async resolve => {
        db.run(`UPDATE users SET 'favs' = ? WHERE login = ?`,
            [JSON.stringify(likes), userLogin],
            (err) => {
                resolve(new sysController.createResponse(
                    's',
                    `Updated favourites list of ${userLogin}`,
                    {},
                    err,
                    `Error updating favourites list of ${userLogin}`
                ))
            })
    })
}