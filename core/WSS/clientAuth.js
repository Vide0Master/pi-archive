
const timeouts = {
    OtAFK: 1000 * 60,
    AFKtOFLL: 1000 * 60 * 10
}

const userStatus = [
    'online',
    'afk'
]

module.exports = (activeClients, userWS, sessionData, userData, requestData) => {
    function updateForAll(user) {
        for (const client in activeClients) {
            const currentCL = activeClients[client]
            currentCL.ws.send(JSON.stringify(
                {
                    type: "userStatusUpdate",
                    target: user.login,
                    data: { state: user.status }
                }
            ))
        }
    }

    if (!activeClients[sessionData.key]) {
        activeClients[sessionData.key] = {
            ws: userWS,
            status: userStatus[0],
            login: userData.login,
            sessionTimeout: setTimeout(() => {
                updateForAll({
                    login: userData.login,
                    status: 'afk'
                })
                activeClients[sessionData.key].status = userStatus[1]
                activeClients[sessionData.key].sessionTimeout = setTimeout(() => {
                    updateForAll({
                        login: userData.login,
                        status: 'offline'
                    })
                    delete activeClients[sessionData.key]
                }, timeouts.AFKtOFLL);
            }, timeouts.OtAFK)
        }
        updateForAll({
            login: userData.login,
            status: 'online'
        })
    } else {
        updateForAll({
            login: userData.login,
            status: 'online'
        })
        activeClients[sessionData.key].ws = userWS
        activeClients[sessionData.key].status = userStatus[0]
        clearTimeout(activeClients[sessionData.key].sessionTimeout)
        activeClients[sessionData.key].sessionTimeout = setTimeout(() => {
            updateForAll({
                login: userData.login,
                status: 'afk'
            })
            activeClients[sessionData.key].status = userStatus[1]
            activeClients[sessionData.key].sessionTimeout = setTimeout(() => {
                updateForAll({
                    login: userData.login,
                    status: 'offline'
                })
                delete activeClients[sessionData.key]
            }, timeouts.AFKtOFLL);
        }, timeouts.OtAFK)
    }

    return
}