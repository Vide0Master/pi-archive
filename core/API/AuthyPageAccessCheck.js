
//Authy проверка доступа к странице
//не используется для TG бота

const SysController = require('../systemController.js')
const pageRestrictions = SysController.config.static.restrictions.pages

module.exports = (request) => {
    return new Promise(async resolve => {
        let permission_level = ''
        if (request.userKey == '') {
            permission_level = 0
        } else {
            permission_level = await SysController.dbinteract.getUserPermission(request.userKey)
        }
        if (permission_level >= pageRestrictions[request.page]) {
            resolve({ result: 's', perm_level: permission_level })
        } else {
            resolve({ result: 'access_rejection' })
        }
    })
}