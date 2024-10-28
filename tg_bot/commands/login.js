
const tgBotController = require('../tgBotController');
const sysController = tgBotController.sysController
module.exports = async (bot, chatId, userdata, ...arguments) => {
    if(userdata){
        tgBotController.useUtil('sendMessage', chatId, 'You are already logged in')
        return
    }
    console.log(arguments)
    const loginrslt = await tgBotController.API('login', { type: 'TGBOT', chatId }, { login: arguments[0], password: sysController.hashString(arguments[1] || ''), sessionType: 'TGBOT', userKey: chatId })

    tgBotController.useUtil('sendMessage', chatId, JSON.stringify(loginrslt))
};
