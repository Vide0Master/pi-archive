const sysController = require('../systemController')

module.exports = (db, login) => {
    return new Promise(async resolve => {
        const newPass = sysController.hashGen(10) 

        db.run(`UPDATE users SET password = ? WHERE login = ?`, [sysController.hashString(sysController.hashString(newPass)), login], (err) => {
            resolve(new sysController.createResponse(
                's',
                `Updated pass`,
                { newPass },
                err,
                `Error updating pass`
            ))
        })
    })
}