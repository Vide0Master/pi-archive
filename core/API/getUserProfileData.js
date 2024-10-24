const SysController = require('../systemController.js')

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
            `{{S_API_GUPD_S}} ${user.login}`,
            { data: user, isOwner }
        ))
    })
}