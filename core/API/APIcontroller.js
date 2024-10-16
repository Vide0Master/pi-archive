
//модуль работы со всеми API

const dbinteract = require('../systemController.js').dbinteract
const APIrestrictions = require('../systemController.js').config.static.restrictions.api
const consoleLogger = require('../consoleLogger.js')

module.exports = async (action, user, request, isTGbotRequest) => {
    return new Promise(async resolve => {
        //переменная для данных пользователя (технические функции и доп проверки безопасности)
        let user_data;
        //получить уровень допуска пользователя
        let user_permission = 0
        if (!isTGbotRequest) {
            user_permission = await dbinteract.getUserPermission(user)
            user_data = await dbinteract.getUserByKey(user)
        } else {
            user_permission = await dbinteract.getUserPermissionTGID(user)
            user_data = await dbinteract.getUserByTGID(user)
        }

        if (user_permission >= APIrestrictions[action]) {
            //если уровень превышает или равен, то
            try {
                //вызвать API файл и обработать запрос
                const rqst = require(`./${action}.js`)
                resolve(await rqst(request, user_data))
            } catch (err) {
                console.log(err)
                resolve({ result: 'API_error', error: err.message })
                consoleLogger(`e/Ошибка модуля API [${action}]: ${err.message}`)
            }
        } else {
            //иначе отказать
            resolve({ result: 'access_rejection', action })
        }
    })
}