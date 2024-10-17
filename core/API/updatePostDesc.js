const SysController = require('../systemController.js')

//экспорт функции
module.exports = (request, user_data) => {
    return new Promise(async resolve => {
        const postData = await SysController.dbinteract.getPostData(request.postID)

        const isOwner = postData.post.author == user_data.login
        const isAdmin = SysController.config.static.user_status[user_data.status] > 1

        if (!isOwner && !isAdmin) {
            resolve(new SysController.createResponse(
                'e',
                'Отказано в доступе.<br>Вы должны быть вледльцем или модератором и выше для редактирования описания.'
            ))
            return
        }

        const max_tags_length = SysController.config.static.restrictions.post_limits.max_desc_length

        if (request.newDesc.length > max_tags_length) {
            resolve(new SysController.createResponse(
                'e',
                `Слишком длинное описание, максимум ${max_tags_length} символов.`
            ))
            return
        }


        const result = await SysController.dbinteract.updatePostDesc(request.postID, request.newDesc)
        resolve(result)
    })
}