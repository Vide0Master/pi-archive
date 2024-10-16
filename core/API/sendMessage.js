//импорт
const syscontroller = require('../systemController.js')

//экспорт функции
module.exports = (request) => {
    return new Promise(async resolve => {
        const msgrslt = await syscontroller.dbinteract.createMessage(request)
        resolve(msgrslt)
    })
}