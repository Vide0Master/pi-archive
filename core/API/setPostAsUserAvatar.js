//импорт
const sysController = require('../systemController.js')

//экспорт функции
module.exports = (request,userData) => {
    return new Promise(async resolve => {
        const rslt = await sysController.dbinteract.setPostAsUserAvatar(request.postID, userData.auth_key)
        resolve(rslt)
    })
}