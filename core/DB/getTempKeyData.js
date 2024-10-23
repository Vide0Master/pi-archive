const sysController = require('../systemController')

module.exports = (db, key) => {
    return new Promise(async resolve => {
        db.get(`SELECT * FROM temp_keys WHERE key = ?`,
            [key],
            (err, row) => {
                resolve(new sysController.createResponse(
                    's',
                    `Got temp key`,
                    { data: row },
                    err,
                    `Error getting temp key`
                ))
            })
    })
}