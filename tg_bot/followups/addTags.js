const tgBotController = require('../tgBotController');

module.exports = async (bot, chatId, userdata, msgID, followupData, ...args) => {

    console.log(userdata)
    console.log(msgID)
    console.log(followupData)
    console.log(args)

    const postData = await tgBotController.API('getPostData', { type: 'TGBOT', key: chatId }, { id: followupData.postID })
    console.log(postData)
    tgBotController.sendMessage(chatId, 'followup')
};
