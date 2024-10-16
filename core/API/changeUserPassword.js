const syscontroller = require('../systemController.js')

//экспорт функции
module.exports = (request) => {
    return new Promise(async resolve => {
        const rslt = await syscontroller.dbinteract.changeUserPassword(request.userKey, request.newPassword)
        resolve(rslt)
    })
}