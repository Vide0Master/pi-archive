const syscontroller = require('../systemController.js')

module.exports = (request) => {
    return new Promise(async resolve => {
        switch (request.type) {
            case 'getUsers': {
                resolve(syscontroller.dbinteract.getUsersList())
            }; break;
            case 'resetPass': {
                resolve(syscontroller.dbinteract.updateUserPass(request.user))
            }; break;
        }
    })
}