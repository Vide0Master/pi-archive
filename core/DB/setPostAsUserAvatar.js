const sysController = require('../systemController')

module.exports = (db, postID, userKey) => {
    return new Promise(async resolve => {
        db.run(`UPDATE users SET avatarpostid = ? WHERE auth_key = ?`,
            [postID, userKey],
            (err) => {
                if (err) {
                    resolve({ rslt: 'e', msg: err })
                    sysController.log(`e/Ошибка установки ID аватара: ${err}`)
                } else {
                    resolve({rslt:'s', msg:`s/Успешно установлен аватар ID:${postID}`})
                }
            })
    })
}