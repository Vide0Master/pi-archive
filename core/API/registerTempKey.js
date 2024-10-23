const SysController = require('../systemController.js')

module.exports = (request,userData) => {
    return new Promise(async resolve => {
        const tempKey = await SysController.dbinteract.createTempKey(
            userData.login,
            request.expires,
            request.post
        )
        resolve(tempKey)
    })
}