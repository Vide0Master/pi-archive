
const tgBotController = require('../tgBotController');
const sysController = tgBotController.sysController

module.exports = async (bot, chatId, userdata, ...arguments) => {
    const postData = await tgBotController.API('getPostData', { type: 'TGBOT', key: chatId }, { id: arguments[0] })
    if (postData.rslt == 'e') {
        tgBotController.sendMessage(chatId, 'Error: ' + postData.msg)
        return
    } else if (postData.rslt == 'w') {
        tgBotController.sendMessage(chatId, 'No such post!')
        return
    }
    tgBotController.followups[chatId] = { type: 'addTags', data: { postID: arguments[0] } }
    tgBotController.sendMessage(chatId, 'Write tags that you want to add:')
};
