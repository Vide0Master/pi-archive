const syscontroller = require('../systemController.js')

module.exports = (request, user) => {
    return new Promise(async resolve => {
        if (syscontroller.config.static.user_status[user.status] >= 3) {
            resolve(new syscontroller.createResponse(
                's',
                'Change da world... My final message... Goodbye...'
            ))
            syscontroller.log('Server stopping due to request from webpage', [{ txt: "STOP", txtc: "green", txtb: "black" }])
            setTimeout(() => {
                syscontroller.dbinteract.stopServer()
            }, 1000)
        } else {
            resolve(new syscontroller.createResponse(
                'e',
                'You are NOT permitted to do this operation'
            ))
        }
    })
}