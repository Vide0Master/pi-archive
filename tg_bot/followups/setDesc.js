const tgBotController = require('../tgBotController');
const sysController = require('../../core/systemController')

module.exports = async (bot, chatId, msgID, userdata, followupData, ...args) => {
    const lpack = tgBotController.getUserLang(userdata)
    const newDesc = args[0]

    const postData = await tgBotController.API('getPostData', chatId, { id: followupData.postID })
    if (postData.rslt == 'e') {
        tgBotController.sendMessage(chatId, 'Error: ' + postData.msg, msgID)
        return
    }

    const tagRslt = await tgBotController.API('updatePostDesc', chatId, { postID: followupData.postID, newDesc: newDesc })

    if (tagRslt.rslt == 'e') {
        tgBotController.sendMessage(chatId, 'Error: ' + tagRslt.msg, msgID)
        return
    }
    
    tgBotController.sendMessage(chatId, `${lpack.setDesc.descAdded} ${followupData.postID}!`, msgID)
    delete tgBotController.followups[chatId]
};
