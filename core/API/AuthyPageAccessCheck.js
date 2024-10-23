
const SysController = require('../systemController.js')
const pageRestrictions = SysController.config.static.restrictions.pages

module.exports = (request, user_data) => {
    return new Promise(async resolve => {
        let permission_level = ''
        if (!user_data) {
            permission_level = 0
        } else {
            permission_level = SysController.config.static.user_status[user_data.status]
        }
        if (permission_level >= pageRestrictions[request.page]) {
            resolve({ result: 's', perm_level: permission_level })
        } else {
            resolve({ result: 'access_rejection' })
        }
    })
}