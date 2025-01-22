const sysController = require('../systemController.js')

module.exports = (request, user) => {
    return new Promise(async resolve => {
        switch (request.type) {
            case "getPostFlags": {
                resolve(await sysController.dbinteract.getPostFlags(request.postID))
            }; break;
            case "getGroupFlags": {

            }; break;
            case "getUserFlags": {

            }; break;
        }
    })
}