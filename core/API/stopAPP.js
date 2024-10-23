const syscontroller = require('../systemController.js')

module.exports = (request, user) => {
    return new Promise(async resolve => {
        if (syscontroller.config.static.user_status[user.status] >= 3) {
            resolve(new syscontroller.createResponse(
                's',
                '{{S_API_SS_SS}}'
            ))
            syscontroller.log('Server stopping due to request from webpage', [{ txt: "STOP", txtc: "green", txtb: "black" }])
            setTimeout(() => {
                syscontroller.dbinteract.stopServer()
            }, 1000)
        } else {
            resolve(new syscontroller.createResponse(
                'e',
                '{{S_API_SS_AR}}'
            ))
        }
    })
}