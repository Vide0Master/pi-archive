const syscontroller = require('../systemController.js')

//экспорт функции
module.exports = (request, user) => {
    return new Promise(async resolve => {
        switch (request.type) {
            case 'createComment': {
                const messageCreateResult = await syscontroller.dbinteract.createMessage(
                    {
                        message: request.data.comment,
                        from: user.login,
                        to: request.data.postID,
                        msgtype: 'COMMENT'
                    })
                if (messageCreateResult.rslt == 's') {
                    resolve(new syscontroller.createResponse('s', 'Комментарий добавлен!'))
                } else {
                    resolve(messageCreateResult)
                }
            }; break;
            case 'getPostComments': {
                const postMessagesResult = await syscontroller.dbinteract.getPostComments(request.postID)
                resolve(postMessagesResult)
            }; break;
            case 'deleteComment': {
                const deleteResult = await syscontroller.dbinteract.deleteMessage(request.messageID)
                if (deleteResult.rslt == 'e') {
                    resolve(new syscontroller.createResponse('e','Ошибка удаления комментария!'))
                } else {
                    resolve(new syscontroller.createResponse('s','Комментарий удалён'))
                }
            }; break;
        }
    })
}