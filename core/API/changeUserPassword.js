const syscontroller = require('../systemController.js')

module.exports = (request,user) => {
    return new Promise(async resolve => {
        const rslt = await syscontroller.dbinteract.changeUserPassword(user.login, request.newPassword)
        resolve(rslt)
    })
}