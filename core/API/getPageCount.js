const syscontroller = require('../systemController.js')

module.exports = (request,user) => {
    return new Promise(async resolve => {
        const user_sets = user.usersettings
        const posts_count = await syscontroller.dbinteract.getPostsCount(
            request.tags,
            request.blacklist.concat(user.blacklist || '[]')
        )
        if (posts_count.rslt != 's') {
            resolve(posts_count)
            return
        }
        resolve(new syscontroller.createResponse(
            's',
            'Calculated page count',
            { pages: Math.ceil(posts_count.count / user_sets.posts_per_page) },
        ))
    })
}