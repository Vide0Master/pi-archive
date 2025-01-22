const sysController = require('../systemController.js')

module.exports = (request, user) => {
    return new Promise(async resolve => {
        switch (request.type) {
            case 'createReportForPost': {
                const msg = sysController.dbinteract.createMessage({
                    message: '',
                    from: "SYSTEM",
                    to: request.postAuthor,
                    msgtype: 'SYSTEM_ACTION_'+ request.repType,
                    specialdata: {
                        initiator: user.login,
                        reference: 'POST_' + request.postID,
                        comment: request.comment,
                        oldTagsList: request.oldTagsList,
                        newTagsList: request.newTagsList,
                        description: request.description,
                        groupID: request.groupID,
                        sourcePostID: request.sourcePostID
                    }
                })
                resolve(msg)
            }; break;
            case 'createReportForGroup': {

            }; break;
            case 'createReportForUser': {

            }; break;
            case 'setReportStatus':{
                const updateResult = await sysController.dbinteract.updateReportState(request.id,request.state)
                resolve(updateResult)
            };break;
        }
    })
}