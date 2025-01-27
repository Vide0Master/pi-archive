
const SysController = require('../systemController.js')

module.exports = (request, user) => {
    return new Promise(async resolve => {
        const data = await SysController.dbinteract.getPostData(request.id)

        if (data.rslt == 'e') {
            resolve(data)
            return
        }

        if (!data.post) {
            resolve(new SysController.createResponse(
                'w',
                'No such post'
            ))
            return
        }

        data.post.size = JSON.parse(data.post.size)
        data.post.source = JSON.parse(data.post.source)
        data.post.tags = JSON.parse(data.post.tags)
        data.post.timestamp = JSON.parse(data.post.timestamp)

        const postGroup = await SysController.dbinteract.getPostGroup(request.id)

        if (postGroup.data) {
            data.post.postGroupData = postGroup.data
            const groupScoreResult = await SysController.dbinteract.getPostLikesDislikesFavs("GROUP:" + postGroup.data.id)
            if (groupScoreResult.rslt != 'e') {
                post.postGroupData.scores = groupScoreResult.scores
            }
        }

        const postComments = await SysController.dbinteract.getPostComments(request.id)

        data.post.commentCount = postComments.comments.length

        const postRatings = await SysController.dbinteract.getPostLikesDislikesFavs(request.id)

        data.post.postRating = postRatings.scores

        data.post.postRating.faved = user.favs.includes(request.id)

        const postFlags = await SysController.dbinteract.getPostFlags(request.id)

        data.post.flags = postFlags.flags

        resolve(data)
    })
}