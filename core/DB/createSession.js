const sysController = require('../systemController')

module.exports = (db, user, stype, skey) => {
    return new Promise(async resolve => {
        db.run(`INSERT INTO sessions(user,type,key,tslac)
            VALUES(?,?,?,?)`,
            [user, stype, skey, Date.now()],
            (err) => {
                resolve(new sysController.createResponse(
                    's',
                    `Created session`,
                    {},
                    err,
                    `Error creating session`
                ))
            })
    })
}