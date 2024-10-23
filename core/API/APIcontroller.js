
//API

const dbinteract = require('../systemController.js').dbinteract
const APIrestrictions = require('../systemController.js').config.static.restrictions.api
const consoleLogger = require('../consoleLogger.js')
const LanguageManager = require('../lang/langController.js')
const config = require('../systemController.js').config

module.exports = async (action, user, request) => {
    return new Promise(async resolve => {
        let user_data = null;
        let user_permission = 0

        if (user) {
            const userRslt = await dbinteract.getUserBySessionData(user.type, user.key)
            if (userRslt.rslt == "s") {
                user_data = userRslt.user
                user_permission = config.static.user_status[user_data.status]

                const latConfirm = await dbinteract.checkSessionLAT(user.type, user.key)
                if(latConfirm.rslt=='e'){
                    resolve(latConfirm)
                    return
                }
                if(!latConfirm.valid){
                    const sessDelRslt =  await dbinteract.deleteUserSession(user.type, user.key)
                    if(sessDelRslt.rslt=='s'){
                        resolve({ result: 'access_rejection', action })
                        return
                    }
                    resolve(sessDelRslt)
                    return
                }
            }
        }

        let userLanguage
        if (!user_data || !user_data.usersettings || !user_data.usersettings.lang) userLanguage = 'ENG'
        if (user_permission >= APIrestrictions[action]) {
            try {
                const rqst = require(`./${action}.js`)
                const rqst_rslt = await rqst(request, user_data)
                if (rqst_rslt.msg)
                    rqst_rslt.msg = LanguageManager.parseLine(rqst_rslt.msg, LanguageManager.translations[userLanguage])
                resolve(rqst_rslt)
            } catch (err) {
                resolve({ rslt: 'e', msg: err.message })
                consoleLogger(`e/[${action}]: ${err.message}`, [{ txt: 'API', txtc: "blue", txtb: "white" }, { txt: action, txtc: "white", txtb: "blue" }])
            }
        } else {
            resolve({ result: 'access_rejection', action })
        }
    })
}