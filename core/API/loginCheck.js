//импорт
const SysController = require('../systemController.js')

//экспорт функции
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