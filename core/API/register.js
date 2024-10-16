//импорт
const consoleLogger = require('../consoleLogger.js')
const dbinteract = require('../DB/DBController.js')
const SysController = require('../systemController.js')

//экспорт функции
module.exports = (request) => {
    return new Promise(async resolve => {
        //запрос создания профиля
        const create_profile_result = await dbinteract.createUser({
            login: request.login,
            password: request.password,
            username: request.username,
        })
        //проверка ошибки
        if (create_profile_result.rslt == 'e') {
            consoleLogger(`${create_profile_result.rslt}/${create_profile_result.msg}`)
            resolve(create_profile_result)
            return
        }
        //создание сообщения
        const register_message_result = await dbinteract.createMessage({
            message: request.admin_message,
            from: request.login,
            to: 'SYSTEM',
            msgtype: 'REGISTER'
        })
        //проверка ошибки
        if (register_message_result.rslt == 'e') {
            consoleLogger(`${register_message_result.rslt}/${register_message_result.msg}`)
            resolve(register_message_result)
            return
        }
        //ответ пользователю и уведомление в консоль
        
        resolve(new SysController.createResponse('s','Профиль создан и ожидает подтверждения администратором.'))
        consoleLogger(`i/Зарегестрирован новый пользователь ${request.username} и ожидает подтверждения`)
    })
}