
const sysController = require('../../core/systemController');
const tgBotController = require('../tgBotController');


module.exports = async (bot, chatId, msgId, userdata, ...arguments) => {
    const lpack = tgBotController.getUserLang(userdata)

    const postData = await tgBotController.API('getPostData', chatId, { id: arguments[0] })
    if (postData.rslt == 'e') {
        tgBotController.sendMessage(chatId, `${lpack.setDesc.err}: ` + postData.msg, msgId)
        return
    } else if (postData.rslt == 'w') {
        tgBotController.sendMessage(chatId, `${lpack.setDesc.noPost}!`, msgId)
        return
    }
    if (postData.post.author != userdata.login && sysController.config.static.user_status[userdata.status] < 2) {
        tgBotController.sendMessage(chatId, `${lpack.setDesc.editRestr}!`, msgId)
        return
    }
    tgBotController.followups[chatId] = { type: 'setDesc', data: { postID: arguments[0] } }
    tgBotController.sendMessage(chatId, `${lpack.setDesc.writeTags}`, msgId)
};
