const sysController = require('../systemController')

module.exports = (request, user_data) => {
    return new Promise(async resolve => {
        switch (request.type) {
            case "update": {
                for (const dat in request.update) {
                    if (!user_data.usersettings[dat] || user_data.usersettings[dat] != request.update[dat]) {
                        user_data.usersettings[dat] = request.update[dat]
                    }
                }
                const upd_rslt = await sysController.dbinteract.setUserSettings(user_data.login, user_data.usersettings)
                resolve(upd_rslt)
            }; break
        }
    })
}