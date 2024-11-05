const sysController = require('../systemController.js')

module.exports = (request, userData) => {
    return new Promise(async resolve => {
        const rslt = await sysController.dbinteract.setPostAsUserAvatar(request.postID, userData.login)
        resolve(rslt)
    })
}