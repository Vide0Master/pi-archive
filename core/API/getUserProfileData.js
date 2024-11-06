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
        } else {
            user.acc_level = SysController.config.static.user_status[user.status]
        }
        user.usersettings = JSON.parse(user.usersettings)
        user.postsCount = (await SysController.dbinteract.getPostsCount([`author:${user.login}`])).count || 0

        resolve(new SysController.createResponse(
            's',
            `Got data of user ${user.login}`,
            { data: user, isOwner }
        ))
    })
}