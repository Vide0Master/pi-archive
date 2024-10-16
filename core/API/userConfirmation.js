
const SysController = require('../systemController.js')

module.exports = (request) => {
    return new Promise(async resolve => {
        switch (request.type) {
            case 'confirm': {
                const user_confirm_status = await SysController.dbinteract.updateUserStatus(request.login, 'user')
                if (user_confirm_status.rslt == 'e') {
                    SysController.log(`${user_confirm_status.rslt}/${user_confirm_status.msg}`)
                    resolve(user_confirm_status)
                    return
                }

                const message_deletion_status = await SysController.dbinteract.deleteMessage(request.messageID)
                if (message_deletion_status.rslt == 'e') {
                    SysController.log(`${message_deletion_status.rslt}/${message_deletion_status.msg}`)
                    resolve(message_deletion_status)
                    return
                }

                resolve(new SysController.createResponse('s',`Пользователь ${request.login} был подтверждён.`))
            }; break;
            case 'reject': {
                const user_delition_status = await SysController.dbinteract.deleteUser(request.login)
                if (user_delition_status.rslt == 'e') {
                    SysController.log(`${user_delition_status.rslt}/${user_delition_status.msg}`)
                    resolve(user_delition_status)
                    return
                }
                
                const message_deletion_status = await SysController.dbinteract.deleteMessage(request.messageID)
                if (message_deletion_status.rslt == 'e') {
                    SysController.log(`${message_deletion_status.rslt}/${message_deletion_status.msg}`)
                    resolve(message_deletion_status)
                    return
                }

                resolve(new SysController.createResponse('w',`Пользователю ${request.login} было отказано, профиль удалён.`))
            }; break;
        }
    })
}