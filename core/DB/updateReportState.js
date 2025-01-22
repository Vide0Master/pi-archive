const sysController = require('../systemController')

module.exports = (db, msgID, state) => {
    return new Promise(async resolve => {
        db.run(`UPDATE messages SET read = ? WHERE messageid = ?`,
            [state, msgID],
            (err) => {
                resolve(new sysController.createResponse(
                    's',
                    `Updated report state`,
                    {},
                    err,
                    `Error updating report state`
                ))
            }
        )
    })
}