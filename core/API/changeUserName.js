const syscontroller = require('../systemController.js')

module.exports = (request) => {
    return new Promise(async resolve => {
        const rslt = await syscontroller.dbinteract.changeUserName(request.userKey, request.newName)
        resolve(rslt)
    })
}