const sysController = require('../systemController')

module.exports = (db, key) => {
    return new Promise(async resolve => {
        db.run(`DELETE FROM temp_keys WHERE key = ?`,
            [key],
            err => {
                resolve(new sysController.createResponse(
                    's',
                    `Temporary key deleted`,
                    {},
                    err,
                    `Error deleting temporary key`
                ))
            })
    })
}