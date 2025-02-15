const syscontroller = require('../systemController.js')

module.exports = (request) => {
    return new Promise(async resolve => {
        const rslt = await syscontroller.dbinteract.deleteMessage(request.id)
        resolve(rslt)
    })
}