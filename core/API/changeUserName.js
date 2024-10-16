const syscontroller = require('../systemController.js')

//экспорт функции
module.exports = (request) => {
    return new Promise(async resolve => {
        const rslt = await syscontroller.dbinteract.changeUserName(request.userKey, request.newName)
        resolve(rslt)
    })
}