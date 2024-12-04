const sysController = require('../systemController')

module.exports = (db, login) => {
    return new Promise(async resolve => {
        db.all(`SELECT * FROM sessions WHERE user = ?`, [login],(err,rows)=>{
            resolve(new sysController.createResponse(
                's',
                `Got sessions list of ${login}`,
                {sessions:rows},
                err,
                `Error getting sessions list of ${login}`
            ))
        })
    })
}