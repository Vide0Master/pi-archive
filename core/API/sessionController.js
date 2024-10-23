const syscontroller = require('../systemController.js')

class session {
    constructor(type, key, lastActionTime) {
        this.type = type
        this.key = key
        this.lat = lastActionTime
    }
}

module.exports = (request) => {
    return new Promise(async resolve => {
        switch (request.type) {
            case 'getSessions': {

            }; break;
            case 'addSession': {
                const rslt = await syscontroller.dbinteract.createSession(request.login, request.stype, request.skey)
                resolve(rslt)
            }; break;
            case 'removeSession': {

            }; break;
            case 'resetSessions': {

            }; break;
            case 'checkSession': {

            }; break;
            case 'getUserBySessionData': {

            }; break;
        }
    })
}
