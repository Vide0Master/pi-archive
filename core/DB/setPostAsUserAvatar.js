const sysController = require('../systemController')

module.exports = (db, postID, login) => {
    return new Promise(async resolve => {
        db.run(`UPDATE users SET avatarpostid = ? WHERE login = ?`,
            [postID, login],
            (err) => {
                resolve(new sysController.createResponse(
                    's',
                    'Set avatar',
                    {},
                    err,
                    'Error setting avatar'
                ))
            })
    })
}