//импорт
const syscontroller = require('../systemController.js')

//экспорт функции
module.exports = (request, user) => {
    return new Promise(async resolve => {
        if (syscontroller.config.static.user_status[user.status] >= 3) {
            resolve(new syscontroller.createResponse(
                's',
                'Сервер выключается'
            ))
            setTimeout(()=>{
                syscontroller.dbinteract.stopServer()
            },1000)
        } else {
            resolve(new syscontroller.createResponse(
                'e',
                'У вас нет доступа для выполнения данной операции!'
            ))
        }
    })
}