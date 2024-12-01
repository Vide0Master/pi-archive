const dbinteract = require('../DB/DBController.js')

const WSSController = class {
    static WSS

    static activeCliets = {}

    static async pocessRequest(UWS, type, user, data) {
        if (!this.activeCliets[user.key] && type != 'clientAuth') {
            return
        }
        let userData
        const userRslt = await dbinteract.getUserBySessionData(user.type, user.key)
        if (userRslt.rslt == "s") {
            userData = userRslt.user

            const latConfirm = await dbinteract.checkSessionLAT(user.type, user.key)
            if (latConfirm.rslt == 'e') {
                return
            }
            if (!latConfirm.valid) {
                await dbinteract.deleteUserSession(user.type, user.key)
                return
            }
        }
        if (userData) {
            require(`./${type}.js`)(this.activeCliets, UWS, user, userData, data)
            require(`./clientAuth.js`)(this.activeCliets, UWS, user, userData)
        }
    }
}

module.exports = WSSController