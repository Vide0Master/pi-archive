const sysController = require('../systemController')

module.exports = (request, user_data) => {
    return new Promise(async resolve => {
        switch (request.type) {
            case 'getUserDMs': {
                const DMs = await sysController.dbinteract.getUserDMs(user_data.login)
                resolve(DMs)
            }; break;
            case 'getUserDMMessages': {
                const DMMs = await sysController.dbinteract.getUserDMMessages(user_data.login, request.login)
                resolve(DMMs)
            }; break;
            case 'sendMessage': {
                const sendResult = await sysController.dbinteract.createMessage(
                    {
                        message: request.message,
                        from: user_data.login,
                        to: request.to,
                        msgtype: 'DM'
                    })
                resolve(sendResult)
            }; break;
            case 'readMessage': {
                const ReadResult = await sysController.dbinteract.updateMessageReadStatus(request.msgID, 1)
                resolve(ReadResult)
            }; break;
        }
    })
}