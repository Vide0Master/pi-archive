const sysController = require('../systemController')

module.exports = (db, user, expires, post) => {
    return new Promise(async resolve => {
        const tempKey = sysController.hashGen(30)
        if (expires - 0) {
            expires = parseInt(expires) + Date.now()
        }
        db.run(`INSERT INTO temp_keys ('key','owner','expires','postID')
            VALUES (?,?,?,?)`,
            [tempKey, user, expires, post],
            err => {
                resolve(new sysController.createResponse(
                    's',
                    `Created temp key`,
                    { key: tempKey, expires: expires, post },
                    err,
                    `Error creating temp key`
                ))
            })
    })
}