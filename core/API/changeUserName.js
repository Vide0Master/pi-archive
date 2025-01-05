const syscontroller = require('../systemController.js')

module.exports = (request, userData) => {
    return new Promise(async resolve => {
        const rslt = await syscontroller.dbinteract.changeUserName(userData.login, request.newName)
        resolve(rslt)
    })
}