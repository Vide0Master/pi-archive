const syscontroller = require('../systemController.js')

module.exports = (request, userData) => {
    return new Promise(async resolve => {
        let msgrslt
        if (request.isFile) {
            msgrslt = await syscontroller.TGController.sendPostAsFile(request.postID, userData.tgid)
        } else {
            msgrslt = await syscontroller.TGController.sendPost(request.postID, userData.tgid)
        }

        resolve(msgrslt)
    })
}