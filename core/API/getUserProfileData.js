//импорт
const SysController = require('../systemController.js')

//экспорт функции
module.exports = (request, userByKey) => {
    return new Promise(async resolve => {
        let userByLogin
        if (request.login) {
            const userByLoginResult = await SysController.dbinteract.getUserByLogin(request.login)
            if (userByLoginResult.rslt == 'e') {
                resolve(userByLoginResult)
                return
            } else {
                userByLogin = userByLoginResult.user
                userByLogin.favs = JSON.parse(userByLogin.favs)
            }
        }

        if ((!userByLogin && !request.login) && !userByKey) {
            resolve(new SysController.createResponse('e', 'Такого пользователя нету'))
            return
        }

        let isOwner = false
        if (request.login) {
            isOwner = (userByLogin.login == userByKey.login)
        } else {
            isOwner = true
        }

        let user
        if (request.login) {
            user = userByLogin
        } else {
            user = userByKey
        }

        delete user.password
        delete user.auth_key
        let currentdate = new Date(Math.floor(user.creationdate));
        let datetime = currentdate.getDate() + "/"
            + (currentdate.getMonth() + 1) + "/"
            + currentdate.getFullYear() + " "
            + currentdate.getHours() + ":"
            + currentdate.getMinutes() + ":"
            + currentdate.getSeconds();

        user.creationdate = datetime
        user.trueUserStatus = user.status

        if (!isOwner) {
            delete user.tgid
            delete user.likes
            delete user.dislikes
            delete user.blacklist
            delete user.usersettings
        } else {
            user.acc_level = SysController.config.static.user_status[user.status]
        }

        user.status = SysController.config.static.user_status_translation[user.status]
        user.postsCount = await SysController.dbinteract.getPostsCount([`author:${user.login}`])

        resolve(new SysController.createResponse(
            's',
            `Успешно получены данные пользователя ${user.login}`,
            { data: user, isOwner }
        ))
    })
}