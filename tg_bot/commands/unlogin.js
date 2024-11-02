
const tgBotController = require('../tgBotController');
const sysController = tgBotController.sysController
module.exports = async (bot, chatId, msgId, userdata) => {
    if (!userdata) {
        tgBotController.sendMessage(chatId, 'You are not logged in', msgId)
        return
    }

    const unloginrslt = await tgBotController.API('sessionController', chatId, { type: 'removeSession', stype: 'TGBOT', skey: chatId })

    tgBotController.sendMessage(chatId, unloginrslt.msg, msgId)
};
