const syscontroller = require('../systemController.js')

module.exports = (request, userdata) => {
    return new Promise(async resolve => {
        const rslt = await syscontroller.dbinteract.getUserSessionList(userdata.login)
        resolve(rslt)
    })
}