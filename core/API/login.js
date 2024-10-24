
const SysController = require('../systemController.js')

module.exports = (request) => {
    return new Promise(async resolve => {
        const userData = await SysController.dbinteract.getUserByLogin(request.login)
        if (!userData.user) {
            resolve(new SysController.createResponse('e', '{{S_API_LGIN_NP}}'))
            return
        }

        if (userData.rslt == 'e') {
            resolve(userData)
            return
        }

        if (SysController.hashString(request.password) != userData.user.password) {
            resolve(new SysController.createResponse('w', '{{S_API_LGIN_WP}}'))
            return
        }

        if (userData.user.status == 'unconfirmed') {
            resolve(new SysController.createResponse('w', '{{S_API_LGIN_UP}}'))
            return
        }

        const key_update = await SysController.APIcontroller('sessionController', null,
            { type: 'addSession', login: request.login, stype: 'WEB', skey: request.userKey })
        if (key_update.rslt == 'e') {
            resolve(key_update)
        } else {
            resolve(new SysController.createResponse('s', '{{S_API_LGIN_S}}'))
        }
    })
}