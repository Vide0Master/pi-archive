//Импорт
const consoleLogger = require('./consoleLogger.js')

module.exports = class SysController {
    //Предоставления доступа к универсальной библиотеке для красивого форматирования вывода данных в консоль
    static log = consoleLogger

    //связь с библиотекой управления БД через syscontroller
    static dbinteract = require('./DB/DBController.js')

    //переменная для работы с конфиграцией
    static config = {

        //общая статическая конфигурация программы
        static: require('../config.json'),

        //приватный кофниг (разные ключи)
        private: require('../config-PRIVATE.json'),

        //динамическая конфигурацая программы из базы данных
        dynamic: SysController.dbinteract.getConfig
    }

    //генератор hash-имени
    static hashGen = require('./hashGen.js')

    //обработчик файлов WEB/TG-universal 
    static fileProcessor = require('./fileProcessor.js')

    //универсальная функция для работы с API
    static async APIcontroller(action, user, request, isTGbotRequest) {
        return await require('./API/APIcontroller.js')(action, user, request, isTGbotRequest)
    }

    //обработка веб запросов
    static async APIprocessorWEB(req, res) {
        const req_body = req.body
        const APIresult = await SysController.APIcontroller(req_body.action, req_body.user, req_body.request, false)
        res.json(APIresult)
    }

    //Обработка ТГ запросов
    static async APIprocessorTG(action, user, request) {
        return new Promise(async resolve => {
            const APIrslt = await SysController.APIcontroller(action, user, request, true)
            resolve(APIrslt)
        })
    }

    static TGController

    static createResponse = require('./responseConstructor.js')
}