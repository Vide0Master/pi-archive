const consoleLogger = require('../consoleLogger.js')

module.exports = (db) => {
    return new Promise(async resolve => {
        const rslt = await new Promise((resolve) => {
            db.all(`SELECT * FROM config`, (err, rows) => {
                if (err) {
                    resolve({ rslt: 'e', msg: err })
                } else {
                    resolve(rows)
                }
            })
        })
        if (rslt.rslt == 'e') {
            consoleLogger(`e/Error getting config: ${rslt.msg}`)
            resolve('e')
        } else {
            const cfg = {}
            for (const record of rslt) {
                cfg[record.key] = record.value
            }
            resolve(cfg)
        }
    })
}