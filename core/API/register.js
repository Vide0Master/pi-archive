const SysController = require('../systemController.js')

module.exports = (request) => {
    return new Promise(async resolve => {
        const create_profile_result = await SysController.dbinteract.createUser({
            login: request.login,
            password: request.password,
            username: request.username,
        })
        if (create_profile_result.rslt == 'e') {
            SysController.log(`${create_profile_result.rslt}/${create_profile_result.msg}`)
            resolve(create_profile_result)
            return
        }
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

        resolve(new SysController.createResponse('s', 'Profile created and waiting for approval'))
        SysController.log(`New user ${request.username} waiting for account confirmation`, [{ txt: "REGISTER", txtc: "green", txtb: "white" }])
    })
}