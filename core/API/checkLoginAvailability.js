const syscontroller = require('../systemController.js')

module.exports = (request) => {
    return new Promise(async resolve => {
        const rslt = await syscontroller.dbinteract.getUserByLogin(request.login)
        resolve(!rslt.user)
    })
}