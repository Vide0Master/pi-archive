
const SysController = require('../systemController.js')

module.exports = (request) => {
    return new Promise(async resolve => {
        const requests = await SysController.dbinteract.getMessageRequests()
        resolve(requests)
    })
}