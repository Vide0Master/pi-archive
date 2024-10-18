
const consoleLogger = require('./consoleLogger.js')

module.exports = class SysController {
    static log = consoleLogger

    static dbinteract = require('./DB/DBController.js')

    static config = {
        static: require('../config.json'),

        private: require('../config-PRIVATE.json'),

        dynamic: SysController.dbinteract.getConfig
    }

    static hashGen = require('./hashGen.js')

    static fileProcessor = require('./fileProcessor.js')

    static async APIcontroller(action, user, request, isTGbotRequest) {
        return await require('./API/APIcontroller.js')(action, user, request, isTGbotRequest)
    }

    static async APIprocessorWEB(req, res) {
        const req_body = req.body
        const APIresult = await SysController.APIcontroller(req_body.action, req_body.user, req_body.request, false)
        res.json(APIresult)
    }

    static async APIprocessorTG(action, user, request) {
        return new Promise(async resolve => {
            const APIrslt = await SysController.APIcontroller(action, user, request, true)
            resolve(APIrslt)
        })
    }

    static TGController

    static createResponse = require('./responseConstructor.js')

    static langController = require('./lang/langController.js')
}