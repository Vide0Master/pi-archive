
const consoleLogger = require('./consoleLogger.js')

class SysController {
    static log = consoleLogger

    static parseTimestamp(timestamp) {
        let currentdate = new Date(Math.floor(timestamp));

        const padZero = (num) => num.toString().padStart(2, '0');

        let datetime = padZero(currentdate.getDate()) + "."
            + padZero(currentdate.getMonth() + 1) + "."
            + currentdate.getFullYear() + " "
            + padZero(currentdate.getHours()) + ":"
            + padZero(currentdate.getMinutes()) + ":"
            + padZero(currentdate.getSeconds());

        return datetime;
    }

    static dbinteract = require('./DB/DBController.js')

    static config = {
        static: require('../config.json'),

        private: require('../config-PRIVATE.json'),

        dynamic: SysController.dbinteract.getConfig
    }

    static hashGen = require('./hashGen.js')

    static hashString = require('./hashStringToMD5.js')

    static fileProcessor = require('./fileProcessor.js')

    static queryConstructor = require('./userSearchQueryProcessor.js')

    static WSS = require('./WSS/WSSController.js')

    static async APIcontroller(action, user, request, secOverride) {
        return await require('./API/APIcontroller.js')(action, user, request, secOverride)
    }

    static async APIprocessorWEB(req, res) {
        const req_body = req.body
        const APIresult = await SysController.APIcontroller(req_body.action, req_body.user, req_body.request)
        res.json(APIresult)
    }

    static async APIprocessorTG(action, user, request) {
        return new Promise(async resolve => {
            const APIrslt = await SysController.APIcontroller(action, user, request)
            resolve(APIrslt)
        })
    }

    static TGController = require('../tg_bot/tgBotController.js')

    static createResponse = require('./responseConstructor.js')
}

module.exports = SysController

SysController.TGController.sysController = SysController