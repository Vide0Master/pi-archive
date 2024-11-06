const SysController = require('../systemController')

module.exports = (db, tagtext, BL, limit) => {
    return new Promise(async resolve => {
        let params = []
        params.push("%" + tagtext + "%")
        let query = `SELECT * FROM tags WHERE tag LIKE ?`
        for (const blitm of BL) {
            query += " AND tag NOT ?"
            params.push(blitm)
        }
        query += ' ORDER BY count DESC'
        if (limit > 0) {
            query += ` LIMIT ${limit}`
        }
        db.all(query, params,
            (err, rows) => {
                resolve(new SysController.createResponse(
                    's',
                    'Got tag autocomplete list',
                    { tagList: rows },
                    err,
                    'Error getting tag  autocomplete list'
                ))
            })
    })
}