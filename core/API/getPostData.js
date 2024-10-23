
const SysController = require('../systemController.js')

module.exports = (request) => {
    return new Promise(async resolve => {
        const data = await SysController.dbinteract.getPostData(request.id)

        if (data.rslt == 'e') {
            resolve(data)
            return
        }

        if (!data.post) {
            resolve(new SysController.createResponse(
                'w',
                '{{S_API_GPD_PM}}'
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
        }

        const postComments = await SysController.dbinteract.getPostComments(request.id)

        data.post.commentCount = postComments.comments.length

        const postRatings = await SysController.dbinteract.getPostLikesDislikesFavs(request.id)

        data.post.postRating = postRatings.scores

        resolve(data)
    })
}