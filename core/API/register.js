const SysController = require('../systemController.js')

module.exports = (request) => {
    return new Promise(async resolve => {
        let create_profile_result

        const isJoinedWithSpecialMessage = request.admin_message == SysController.config.static.WEBAUTOREGISTERKEY
        if (isJoinedWithSpecialMessage) {
            create_profile_result = await SysController.dbinteract.createUser({
                login: request.login,
                password: request.password,
                username: request.username,
                status: 'user'
            })
        } else {
            create_profile_result = await SysController.dbinteract.createUser({
                login: request.login,
                password: request.password,
                username: request.username,
                status: 'unconfirmed'
            })
        }

        if (create_profile_result.rslt == 'e') {
            SysController.log(`${create_profile_result.rslt}/${create_profile_result.msg}`)
            resolve(create_profile_result)
            return
        }

        if (!isJoinedWithSpecialMessage) {
            const register_message_result = await SysController.dbinteract.createMessage({
                message: request.admin_message,
                from: request.login,
                to: 'SYSTEM',
                msgtype: 'REGISTER'
            })
            if (register_message_result.rslt == 'e') {
                SysController.log(`${register_message_result.rslt}/${register_message_result.msg}`)
                resolve(register_message_result)
                return
            }
        }

        if(isJoinedWithSpecialMessage){
            resolve(new SysController.createResponse('s', 'Profile registered and verified by system'))
        }else{
            resolve(new SysController.createResponse('s', 'Profile registered and waiting for approval'))
            SysController.log(`New user ${request.username} waiting for account confirmation`, [{ txt: "REGISTER", txtc: "green", txtb: "white" }])
        }
    })
}