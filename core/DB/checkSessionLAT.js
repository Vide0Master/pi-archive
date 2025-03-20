const sysController = require('../systemController')

module.exports = (db, type, key) => {
    return new Promise(async resolve => {
        db.get(`SELECT * FROM sessions WHERE type = ? AND key = ?`,
            [type, key],
            (err, row) => {
                if (err) {
                    resolve(new sysController.createResponse(
                        'e',
                        'Error getting session for LAT update'
                    ))
                    return
                }

                if(!row){
                    resolve(new sysController.createResponse(
                        'w',
                        'Session expired',
                        { valid: false }
                    ))
                }

                if (row.tslac < (Date.now() - sysController.config.static.restrictions.sessionTimeLimit)) {
                    resolve(new sysController.createResponse(
                        'w',
                        'Session expired',
                        { valid: false }
                    ))
                }

                db.run(`UPDATE sessions SET tslac = ? WHERE type = ? AND key = ?`,
                    [Date.now(), type, key], (err) => {
                        resolve(new sysController.createResponse(
                            's',
                            `Updated session LAT`,
                            {valid: true},
                            err,
                            `Error updating session LAT`
                        ))
                    })
            })
    })
}