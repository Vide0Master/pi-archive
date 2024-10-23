const sysController = require('../systemController.js')

//экспорт функции
module.exports = (request, user_data) => {
    return new Promise(async resolve => {
        const postData = await sysController.dbinteract.getPostData(request.post)

        if (postData.rslt == 'e') {
            resolve(postData)
            return
        }

        const isOwner = postData.post.author == user_data.login
        const isAdmin = sysController.config.static.user_status[user_data.status] > 1

        if (!isOwner && !isAdmin) {
            resolve(new sysController.createResponse(
                'e',
                '{{S_API_UPT_AR}}'
            ))
            return
        }

        const max_tags_length = sysController.config.static.restrictions.post_limits.max_tags

        if (request.newTags.length > max_tags_length) {
            resolve(new sysController.createResponse(
                'e',
                `{{S_API_UPT_TMT_F}} ${max_tags_length} {{S_API_UPT_TMT_S}}`
            ))
            return
        }

        const result = await sysController.dbinteract.updateTags(request.post, request.newTags)
        resolve(result)
    })
}