const syscontroller = require('../systemController.js')

module.exports = (request, user) => {
    console.log(request)
    console.log(user)
    return new Promise(async resolve => {
        switch (request.type) {
            case 'getSessions': {
                resolve(await syscontroller.dbinteract.getUserSessions(user.login))
            }; break;
            case 'addSession': {
                resolve(await syscontroller.dbinteract.createSession(request.login, request.stype, request.skey))
            }; break;
            case 'removeSession': {
                resolve(await syscontroller.dbinteract.deleteUserSession(request.stype, request.skey))
            }; break;
            case 'resetSessions': {
                const sessData = await syscontroller.dbinteract.getUserSessions(user.login)
                
                if(sessData.rslt=='e'){
                    resolve(sessData)
                    return
                }

                for(const session of sessData.sessions){
                    const delRslt = await syscontroller.dbinteract.deleteUserSession(session.type, session.key)
                    if(delRslt.rslt=='e'){
                        resolve(delRslt)
                        return
                    }
                }

                resolve(new syscontroller.createResponse(
                    's',
                    'Sessions was reset'
                ))
            }; break;
            case 'getUserBySessionData': {
                const user = await syscontroller.dbinteract.getUserBySessionData(request.type, request.key)
                resolve(user)
            }; break;
        }
    })
}
