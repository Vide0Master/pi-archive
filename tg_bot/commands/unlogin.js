
const tgBotController = require('../tgBotController');
const sysController = tgBotController.sysController
module.exports = async (bot, chatId, msgId, userdata) => {
    const lpack = tgBotController.getUserLang(userdata)
    if (!userdata) {
        tgBotController.sendMessage(chatId, lpack.unlogin.noLog, msgId)
        return
    }

    const unloginrslt = await tgBotController.API('sessionController', chatId, { type: 'removeSession', stype: 'TGBOT', skey: chatId })
    if (unloginrslt.rslt == 's') {
        tgBotController.sendMessage(chatId, lpack.unlogin.succ, msgId)
    } else {
        tgBotController.sendMessage(chatId, unloginrslt.msg, msgId)
    }

};
