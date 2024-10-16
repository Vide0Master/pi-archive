const consoleLogger = require('../systemController').log

module.exports = (db, limit) => {
    return new Promise(async resolve => {
        let query = `SELECT * FROM tags ORDER BY count DESC`
        if(limit>0){
            query+=` LIMIT ${limit}`
        }
        db.all(query,
            (err, rows) => {
            if (err) {
                resolve({ rslt: 'e', msg: err })
                consoleLogger(`e/Ошибка получения тегов[getTagList]: ${err}`)
            } else {
                resolve(rows)
            }
        })
    })
}