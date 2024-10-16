const syscontroller = require('../systemController.js')

//экспорт функции
module.exports = (request) => {
    return new Promise(async resolve => {
        const user = await syscontroller.dbinteract.getUserByKey(request.userKey)
        const user_sets = JSON.parse(user.usersettings)
        const posts_count = await syscontroller.dbinteract.getPostsCount(
            request.tags,
            request.blacklist.concat(JSON.parse(user.blacklist||'[]'))
        )
        resolve({ pages: Math.ceil(posts_count / user_sets.posts_per_page) })
    })
}