
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

                resolve(new SysController.createResponse('s',`{{S_API_UC_C_F}} ${request.login} {{S_API_UC_C_S}}`))
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

                resolve(new SysController.createResponse('w',`{{S_API_UC_R_F}} ${request.login} {{S_API_UC_R_S}}`))
            }; break;
        }
    })
}