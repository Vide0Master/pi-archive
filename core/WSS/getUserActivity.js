module.exports = (activeClients, userWS, sessionData, userData, requestData) => {
    const user = Object.entries(activeClients).find(([k, v]) => v.login == requestData.user)
    if (!user) {
        userWS.send(JSON.stringify(
            {
                type: "userStatusUpdate",
                target: requestData.user,
                data: { state: 'offline' }
            }
        ))
    } else {
        userWS.send(JSON.stringify(
            {
                type: "userStatusUpdate",
                target: requestData.user,
                data: { state: user[1].status }
            }
        ))
    }
}