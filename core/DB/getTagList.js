const SysController = require('../systemController')

const consoleLogger = require('../systemController').log

module.exports = (db, limit) => {
    return new Promise(async resolve => {
        let query = `SELECT * FROM tags ORDER BY count DESC`
        if (limit > 0) {
            query += ` LIMIT ${limit}`
        }
        db.all(query,
            (err, rows) => {
                resolve(new SysController.createResponse(
                    's',
                    'Got tag list',
                    { tagList: rows },
                    err,
                    'Error getting tag list'
                ))
            })
    })
}