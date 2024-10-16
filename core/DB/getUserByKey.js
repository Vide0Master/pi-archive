const consoleLogger = require('../consoleLogger.js')

module.exports = (db, key) => {
    return new Promise(async resolve => {
        db.get(`SELECT * FROM users WHERE auth_key = ?`,
            [key],
            (err, row) => {
                if (err) {
                    resolve({ rslt: 'e', msg: err })
                    consoleLogger(`e/Ошибка получения пользователя по ключу: ${err}`)
                } else {
                    if(row){
                        row.favs=JSON.parse(row.favs)
                        row.likes=JSON.parse(row.likes)
                        row.dislikes=JSON.parse(row.dislikes)
                        row.blacklist=JSON.parse(row.blacklist)
                        row.usersettings=JSON.parse(row.usersettings)
                        resolve(row)
                    }else{
                        resolve(null)
                    }
                }
            })
    })
}