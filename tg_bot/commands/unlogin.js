
const tgBotController = require('../tgBotController');
const sysController = tgBotController.sysController
module.exports = async (bot, chatId, userdata) => {
    if (!userdata) {
        tgBotController.useUtil('sendMessage', chatId, 'You are not logged in')
        return
    }

    const unloginrslt = await tgBotController.API('sessionController', { type: 'TGBOT', chatId }, { type: 'removeSession', stype: 'TGBOT', skey: chatId })

    tgBotController.useUtil('sendMessage', chatId, unloginrslt.msg)
};
