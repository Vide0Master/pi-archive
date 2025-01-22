const sysController = require('../systemController.js')

module.exports = (request, user) => {
    return new Promise(async resolve => {
        switch (request.type) {
            case 'getSystemMessages':{
                resolve(await sysController.dbinteract.getSystemMessages(user.login))
            };break;
        }
    })
}