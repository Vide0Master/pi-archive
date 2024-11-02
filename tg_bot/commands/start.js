const tgBotController = require('../tgBotController');

module.exports = (bot, chatId) => {

    const welcomeMessage = [
        'Welcome to Pi-Archive bot!',
        `First things first - you need to /login in bot with your login and password which you user for website\n(finally i've removed use of user keys)`,
        'After that, there are /help for you!',
        `Stay tuned on <b>Pi-Archive's <a href="https://github.com/Vide0Master/pi-archive">GitHub</a></b> page for updates\nYou can also fill issue report there... This will make development easier for me!`,
        'Stay safe\nСлава Україні 🇺🇦!'
    ]

    tgBotController.sendMessage(chatId, welcomeMessage.join('\n\n'))
};
