module.exports = (activeClients, userWS, userData, requestData) => {
    const user = activeClients[requestData.user]
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
                data: { state: user.status }
            }
        ))
    }
}