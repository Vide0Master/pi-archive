const sysController = require('../systemController')

module.exports = (db, type, key) => {
    return new Promise(async resolve => {
        db.get(`SELECT * FROM sessions WHERE type = ? AND key = ?`,
            [type, key],
            (err, row) => {
                if (err) {
                    resolve(new sysController.createResponse(
                        'e',
                        `Error getting session data: ${err}`,
                    ))
                } else {
                    console.log(row)
                    let login = ''
                    if (row) login = row.user
                    db.get(`SELECT * FROM users WHERE login = ?`, [login],
                        (err, row) => {
                            if (!row) {
                                resolve(new sysController.createResponse(
                                    'w',
                                    'No user for this session data',
                                    { user: null }
                                ))
                                return
                            }
                            resolve(new sysController.createResponse(
                                's',
                                `Got user with session data`,
                                { user: row },
                                err,
                                "Error getting user by session data"
                            ))
                        }
                    )
                }
            }
        )
    })
}