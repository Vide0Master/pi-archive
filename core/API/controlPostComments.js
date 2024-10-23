const sysController = require('../systemController.js')

//экспорт функции
module.exports = (request, user) => {
    return new Promise(async resolve => {
        switch (request.type) {
            case 'createComment': {
                const messageCreateResult = await sysController.dbinteract.createMessage(
                    {
                        message: request.data.comment,
                        from: user.login,
                        to: request.data.postID,
                        msgtype: 'COMMENT'
                    })
                if (messageCreateResult.rslt == 's') {
                    resolve(new sysController.createResponse('s', '{{S_API_CPC_CC}}!'))
                } else {
                    resolve(messageCreateResult)
                }
            }; break;
            case 'getPostComments': {
                const postMessagesResult = await sysController.dbinteract.getPostComments(request.postID)
                resolve(postMessagesResult)
            }; break;
            case 'deleteComment': {
                const deleteResult = await sysController.dbinteract.deleteMessage(request.messageID)
                if (deleteResult.rslt == 'e') {
                    resolve(new sysController.createResponse('e','{{S_API_CPC_CR_E}}!'))
                } else {
                    resolve(new sysController.createResponse('s','{{S_API_CPC_CR_S}}'))
                }
            }; break;
        }
    })
}