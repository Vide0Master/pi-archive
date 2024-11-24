
const timeouts = {
    OtAFK: 1000 * 60,
    AFKtOFLL: 1000 * 60 * 10
}

const userStatus = [
    'online',
    'afk'
]

module.exports = (activeClients, userWS, sessionData, userData, requestData) => {
    if (!activeClients[sessionData.key]) {
        activeClients[sessionData.key] = {
            ws: userWS,
            status: userStatus[0],
            login: userData.login,
            sessionTimeout: setTimeout(() => {
                userWS.send('AFK')
                activeClients[sessionData.key].status = userStatus[1]
                activeClients[sessionData.key].sessionTimeout = setTimeout(() => {
                    userWS.send('REMOVED SESSION')
                    delete activeClients[sessionData.key]
                }, timeouts.OtAFK);
            }, timeouts.AFKtOFLL)
        }
        userWS.send('REGISTERED SESSION')
    } else {
        userWS.send('UPDATED SESSION')
        activeClients[sessionData.key].ws = userWS
        activeClients[sessionData.key].status = userStatus[0]
        clearTimeout(activeClients[sessionData.key].sessionTimeout)
        activeClients[sessionData.key].sessionTimeout = setTimeout(() => {
            userWS.send('AFK')
            activeClients[sessionData.key].status = userStatus[1]
            activeClients[sessionData.key].sessionTimeout = setTimeout(() => {
                userWS.send('REMOVED SESSION')
                delete activeClients[sessionData.key]
            }, timeouts.OtAFK);
        }, timeouts.AFKtOFLL)
    }

    console.log(sessionData, requestData, activeClients)
    return
}