const consoleLogger = require('../consoleLogger.js')

module.exports = (db, postID) => {
    return new Promise(async resolve => {
        db.get(`SELECT * FROM posts WHERE id = ?`,
            [postID],
            (err, row) => {
                if (err) {
                    resolve({ rslt: 'e', msg: `Internal error: ` + err, code: 500 })
                    consoleLogger(`e/${err}`)
                } else {
                    if (!row) {
                        resolve({ rslt: 'e', msg: 'No record', code: 400 })
                    } else {
                        resolve(row.file)
                    }
                }
            })
    })
}