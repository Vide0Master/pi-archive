const syscontroller = require('../systemController.js')

module.exports = (request) => {
    return new Promise(async resolve => {
        const result = await syscontroller.dbinteract.updateUserBlacklist(request.userKey,request.blacklist)
        resolve(result)
    })
}