const syscontroller = require('../systemController.js')

//экспорт функции
module.exports = (request) => {
    return new Promise(async resolve => {
        const result = await syscontroller.dbinteract.updateUserBlacklist(request.userKey,request.blacklist)
        resolve(result)
    })
}