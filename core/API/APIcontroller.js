
//API

const dbinteract = require('../systemController.js').dbinteract
const APIrestrictions = require('../systemController.js').config.static.restrictions.api
const consoleLogger = require('../consoleLogger.js')
const config = require('../systemController.js').config

module.exports = async (action, user, request, secOverride = false) => {
    return new Promise(async resolve => {
        let user_data = null;
        let user_permission = 0

        if (user) {
            const userRslt = await dbinteract.getUserBySessionData(user.type, user.key)
            if (userRslt.rslt == "s") {
                user_data = userRslt.user
                user_permission = config.static.user_status[user_data.status]

                const latConfirm = await dbinteract.checkSessionLAT(user.type, user.key)
                if (latConfirm.rslt == 'e') {
                    resolve(latConfirm)
                    return
                }
                if (!latConfirm.valid) {
                    const sessDelRslt = await dbinteract.deleteUserSession(user.type, user.key)
                    if (sessDelRslt.rslt == 's') {
                        resolve({ rslt: 'access_rejection', action })
                        return
                    }
                    resolve(sessDelRslt)
                    return
                }
            }
        }

        if(secOverride){
            user_permission=5
        }

        if (user_permission >= APIrestrictions[action]) {
            try {
                const rqst = require(`./${action}.js`)
                const rqst_rslt = await rqst(request, user_data)
                resolve(rqst_rslt)
            } catch (err) {
                resolve({ rslt: 'e', msg: err.message })
                consoleLogger(`e/[${action}]: ${err.message}`, [{ txt: 'API', txtc: "blue", txtb: "white" }, { txt: action, txtc: "white", txtb: "blue" }])
            }
        } else {
            resolve({ rslt: 'access_rejection', msg: 'Access rejected', action })
        }
    })
}