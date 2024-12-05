
const tgBotController = require('../tgBotController');
const sysController = tgBotController.sysController
module.exports = async (bot, chatId, msgID, userdata, ...arguments) => {
    let lpack = tgBotController.getUserLang(userdata)
    if (userdata) {
        tgBotController.sendMessage(chatId, lpack.login.crLogged)
        return
    }
    const loginrslt = await tgBotController.API('login', chatId, { login: arguments[0], password: sysController.hashString(arguments[1] || ''), sessionType: 'TGBOT', userKey: chatId })
    if (loginrslt.rslt == 's') {
        const welcome_messages = await tgBotController.API(
            'getWelcomeText',
            chatId
        )
        const actUdata = await sysController.dbinteract.getUserByLogin(arguments[0])
        let lpack = tgBotController.getUserLang(actUdata.user)
        tgBotController.sendMessage(chatId, lpack.login.succ)
        tgBotController.sendMessage(chatId, `${welcome_messages.welcomeText.text}, ${actUdata.user.username}!`)
        tgBotController.deleteMessage(chatId, msgID)
    } else {
        tgBotController.sendMessage(chatId, loginrslt.msg)
    }

};
