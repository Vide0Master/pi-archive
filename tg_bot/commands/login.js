
const tgBotController = require('../tgBotController');
const sysController = tgBotController.sysController
module.exports = async (bot, chatId, msgID, userdata, ...arguments) => {
    if (userdata) {
        tgBotController.sendMessage(chatId, 'You are already logged in')
        return
    }
    const loginrslt = await tgBotController.API('login', chatId, { login: arguments[0], password: sysController.hashString(arguments[1] || ''), sessionType: 'TGBOT', userKey: chatId })
    if (loginrslt.rslt == 's') {
        const welcome_messages = await tgBotController.API(
            'getWelcomeText',
            chatId
        )
        tgBotController.sendMessage(chatId, `${welcome_messages.welcomeText.text}, ${arguments[0]}!`)
        tgBotController.deleteMessage(chatId, msgID)
    } else {
        tgBotController.sendMessage(chatId, loginrslt.msg)
    }

};
