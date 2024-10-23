const SysController = require('../systemController.js')

//экспорт функции
module.exports = (request, user_data) => {
    return new Promise(async resolve => {

        const max_desc_length = SysController.config.static.restrictions.post_limits.max_desc_length

        if (request.newDesc.length > max_desc_length) {
            resolve(new SysController.createResponse(
                'e',
                `{{S_API_UPD_DIL_F}}: ${max_desc_length} {{S_API_UPD_DIL_S}}`
            ))
            return
        }

        const postData = await SysController.dbinteract.getPostData(request.postID)

        const isOwner = postData.post.author == user_data.login
        const isAdmin = SysController.config.static.user_status[user_data.status] > 1

        if (!isOwner && !isAdmin) {
            resolve(new SysController.createResponse(
                'e',
                '{{S_API_UPD_AR}}'
            ))
            return
        }

        const result = await SysController.dbinteract.updatePostDesc(request.postID, request.newDesc)
        resolve(result)
    })
}