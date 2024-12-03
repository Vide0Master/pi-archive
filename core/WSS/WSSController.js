const dbinteract = require('../DB/DBController.js')

const WSSController = class {
    static WSS

    static activeClients = {}

    static async pocessRequest(UWS, type, user, data) {
        let userData
        const userRslt = await dbinteract.getUserBySessionData(user.type, user.key)
        if (userRslt.rslt == "s") {
            userData = userRslt.user

            const latConfirm = await dbinteract.checkSessionLAT(user.type, user.key)
            if (latConfirm.rslt == 'e') {
                return
            }
            if (!latConfirm.valid) {
                await dbinteract.deleteUserSession(user.type, user.key)
                return
            }
        }
        if (userData) {
            this.userSessionProcessor(userData, user, UWS)
            require(`./${type}.js`)(this.activeClients, UWS, user, userData, data)
        }
    }

    static userSessionProcessor(user, currentSession, userWS) {
        const userStatus = [
            'online',
            'afk',
            'offline'
        ]

        function sendUserStatusToAll() {
            for (const userLogin in WSSController.activeClients) {
                const userCl = WSSController.activeClients[userLogin]
                userCl.send('userStatusUpdate', user.login, { state: WSSController.activeClients[user.login].status })
            }
        }

        if (!this.activeClients[user.login]) {
            this.activeClients[user.login] = {
                WSClients: {},
                status: '',
                send: (type, target, data) => {
                    for (const ws in WSSController.activeClients[user.login].WSClients) {
                        WSSController.activeClients[user.login].WSClients[ws].send(JSON.stringify({ type, target, data }))
                    }
                },
                resetStatusTimer: () => {
                    const timeouts = {
                        OtAFK: 1000 * 60,
                        AFKtOFLL: 1000 * 60 * 10
                    }
                    if (!!WSSController.activeClients[user.login].sessionTimer) {
                        clearTimeout(WSSController.activeClients[user.login].sessionTimer)
                    }
                    WSSController.activeClients[user.login].status = userStatus[0]

                    WSSController.activeClients[user.login].sessionTimer =
                        setTimeout(() => {
                            WSSController.activeClients[user.login].status = userStatus[1]
                            sendUserStatusToAll()
                            WSSController.activeClients[user.login].sessionTimer =
                                setTimeout(() => {
                                    WSSController.activeClients[user.login].status = userStatus[2]
                                    sendUserStatusToAll()
                                }, timeouts.AFKtOFLL);
                        }, timeouts.OtAFK)
                },
            }
        }

        this.activeClients[user.login]
            .WSClients[currentSession.key] = userWS
        this.activeClients[user.login].resetStatusTimer()
        sendUserStatusToAll()
    }
}

module.exports = WSSController