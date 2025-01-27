const syscontroller = require('../systemController.js')

module.exports = (request, user) => {
    return new Promise(async resolve => {
        const user_sets = user.usersettings
        const userQuery = request.query + " " + user.blacklist.map(elem => "-" + elem).join(' ')

        const posts = await syscontroller.dbinteract.getPosts(
            userQuery,
            (request.page - 1) * (request.postsCount || user_sets.posts_per_page),
            request.postsCount || user_sets.posts_per_page,
            !!request.grpOverride)

        if (posts.rslt != 's') {
            resolve(posts)
            return
        }

        for (const post of posts.posts) {
            post.timestamp = parseInt(post.timestamp)
            post.size = JSON.parse(post.size)
            post.source = JSON.parse(post.source)
            post.tags = JSON.parse(post.tags)

            const postGroup = await syscontroller.dbinteract.getPostGroup(post.id)

            if (postGroup.data) {
                post.postGroupData = postGroup.data
                const groupScoreResult = await syscontroller.dbinteract.getPostLikesDislikesFavs("GROUP:"+postGroup.data.id)
                if(groupScoreResult.rslt!='e'){
                    post.postGroupData.scores=groupScoreResult.scores
                }
            }

            const postComments = await syscontroller.dbinteract.getPostComments(post.id)

            post.commentCount = postComments.comments.length

            const postRatings = await syscontroller.dbinteract.getPostLikesDislikesFavs(post.id)

            post.postRating = postRatings.scores

            post.postRating.faved = user.favs.includes(post.id)
        }
        resolve(posts.posts)
    })
}