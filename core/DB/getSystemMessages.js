const sysController = require('../systemController')

module.exports = (db, user) => {
    return new Promise(async resolve => {
        db.all('SELECT * FROM messages WHERE "from" = "SYSTEM" AND "to" = ? ORDER BY messageid DESC', [user], (err, rows) => {
            if(!err){
                for(const rowID in rows){
                    rows[rowID].specialdata=JSON.parse(rows[rowID].specialdata)
                }
            }
            resolve(new sysController.createResponse(
                's',
                `Got system messages for user ${user}`,
                { messages: rows },
                err,
                `Error getting system messages for user ${user}`
            ))
        })
    })
}