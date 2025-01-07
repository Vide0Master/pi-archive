const SysController = require('../systemController.js')

module.exports = (request, user_data) => {
    return new Promise(async resolve => {

        const max_desc_length = SysController.config.static.restrictions.post_limits.max_desc_length

        if (request.newDesc.length > max_desc_length) {
            resolve(new SysController.createResponse(
                'e',
                `Description is too long, limit: ${max_desc_length} symbols`
            ))
            return
        }

        const postData = await SysController.dbinteract.getPostData(request.postID)

        const isOwner = postData.post.author == user_data.login
        const isAdmin = SysController.config.static.user_status[user_data.status] > 1

        if (!isOwner && !isAdmin) {
            resolve(new SysController.createResponse(
                'e',
                'You are NOT permitted to do this operation'
            ))
            return
        }

        const result = await SysController.dbinteract.updatePostDesc(request.postID, request.newDesc)
        resolve(result)
    })
}