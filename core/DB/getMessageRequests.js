const consoleLogger = require('../consoleLogger.js')

module.exports = (db) => {
    return new Promise(async resolve => {
        db.all(`SELECT * FROM messages WHERE "to" = "SYSTEM"`, (err, rows) => {
            if (err) {
                resolve({ rslt: 'e', msg: err })
                consoleLogger(`e/${err}`)
            } else {
                for (let row of rows) {
                    let currentdate = new Date(Math.floor(row.timestamp));
                    let datetime = currentdate.getDate() + "/"
                        + (currentdate.getMonth() + 1) + "/"
                        + currentdate.getFullYear() + " "
                        + currentdate.getHours() + ":"
                        + currentdate.getMinutes() + ":"
                        + currentdate.getSeconds();
                    row.timestamp = datetime
                }

                resolve(rows)
            }
        })
    })
}