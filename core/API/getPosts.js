const syscontroller = require('../systemController.js')

//экспорт функции
module.exports = (request,user) => {
    return new Promise(async resolve => {
        const user_sets = user.usersettings
        const posts = await syscontroller.dbinteract.getPosts(
            request.tags,
            request.blacklist.concat(user.blacklist || '[]'),
            (request.page - 1) * (request.postsCount || user_sets.posts_per_page),
            request.postsCount || user_sets.posts_per_page)

        for (const post of posts) {
            post.timestamp = parseInt(post.timestamp)
            post.size = JSON.parse(post.size)
            post.source = JSON.parse(post.source)
            post.tags = JSON.parse(post.tags)

            const postGroup = await syscontroller.dbinteract.getPostGroup(post.id)

            if (postGroup.data) {
                post.postGroupData = postGroup.data
            }

            const postComments = await syscontroller.dbinteract.getPostComments(post.id)

            post.commentCount = postComments.comments.length

            const postRatings = await syscontroller.dbinteract.getPostLikesDislikesFavs(post.id)

            post.postRating = postRatings.scores
        }
        resolve(posts)
    })
}