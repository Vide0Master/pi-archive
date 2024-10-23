const SysController = require('../systemController.js')

module.exports = (request) => {
    return new Promise(async resolve => {
        const user = await SysController.dbinteract.getUserByKey(request.userKey)
        if(!user){
            resolve({rslt:'e'})
        }else{
            resolve({rslt:'s'})
        }
    })
}