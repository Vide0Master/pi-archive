const syscontroller = require('../systemController.js')

//экспорт функции
module.exports = (request) => {
    return new Promise(async resolve => {
        const user_perm = await syscontroller.dbinteract.getUserPermission(request.userKey)
        if (user_perm == 0) {
            resolve({ rslt: 'e', msg: 'Такого пользователя не существует или профиль пользователя ещё не был подтверждён администратором' })
        } else {
            const id_set_rslt = syscontroller.dbinteract.setTGIDForUser(request.userKey,request.TGID)
            if(id_set_rslt.rslt == 'e'){
                resolve({msg:`Ошбика: ${id_set_rslt.msg}`})
            }else{
                resolve({msg:`Успешно авторизовано!`,userdata: await syscontroller.dbinteract.getUserByKey(request.userKey)})
            }
        }
    })
}