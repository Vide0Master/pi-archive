
const SysController = require('../systemController.js')

module.exports = (request) => {
    return new Promise(async resolve => {
        const userData = await SysController.dbinteract.getUserByLogin(request.login)
        if(!userData.user){
            resolve(new SysController.createResponse('e','Такого профиля не существует'))
            return
        }

        if (userData.rslt == 'e') {
            resolve(userData)
            return
        }

        if (request.password != userData.user.password) {
            resolve(new SysController.createResponse('w','Неверный пароль'))
            return
        }

        if (userData.user.status=='unconfirmed') {
            resolve(new SysController.createResponse('w','Ваш профиль ещё не потверждён администратором'))
            return
        }

        const key_update = await SysController.dbinteract.updateUserKey(request.login, request.userKey)

        if (key_update.rslt == 'e') {
            resolve(key_update)
        } else {
            resolve(new SysController.createResponse('s','Успешная авторизация'))
        }
    })
}