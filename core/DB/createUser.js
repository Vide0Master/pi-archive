const syscontroller = require('../systemController.js')

module.exports = (db, userData) => {
    return new Promise(resolve => {
        db.run(`INSERT INTO users('login', 'password', 'username', 'status', 'creationdate','usersettings')
                VALUES(?, ?, ?, ?, ?, ?)`,
            [userData.login, syscontroller.hashString(userData.password), userData.username, userData.status, Date.now(), JSON.stringify(syscontroller.config.static.standartUserSettings)],
            (err) => {
                resolve(new syscontroller.createResponse(
                    's',
                    `User [${userData.login}] created`,
                    {},
                    err,
                    `Error creating user [${userData.login}]`
                ))
            })
    })
}