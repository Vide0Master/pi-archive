
//модуль работы со всеми API

const dbinteract = require('../systemController.js').dbinteract
const APIrestrictions = require('../systemController.js').config.static.restrictions.api
const consoleLogger = require('../consoleLogger.js')
const LanguageManager = require('../lang/langController.js')

module.exports = async (action, user, request, isTGbotRequest) => {
    return new Promise(async resolve => {

        let user_data;

        let user_permission = 0
        if (!isTGbotRequest) {
            user_permission = await dbinteract.getUserPermission(user)
            user_data = await dbinteract.getUserByKey(user)
        } else {
            user_permission = await dbinteract.getUserPermissionTGID(user)
            user_data = await dbinteract.getUserByTGID(user)
        }
        
        if (user_permission >= APIrestrictions[action]) {
            try {
                const rqst = require(`./${action}.js`)
                const rqst_rslt = await rqst(request, user_data)
                if (rqst_rslt.msg)
                    rqst_rslt.msg = LanguageManager.parseLine(rqst_rslt.msg, LanguageManager.translations[user_data.usersettings.lang || 'ENG'])
                resolve(rqst_rslt)
            } catch (err) {
                console.log(err)
                resolve({ result: 'API_error', error: err.message })
                consoleLogger(`e/API error [${action}]: ${err.message}`)
            }
        } else {
            resolve({ result: 'access_rejection', action })
        }
    })
}