const tgBotController = require('../tgBotController');

module.exports = (bot, chatId) => {

    const welcomeMessage = 'Добро пожаловать в PI Archive!\n\nЭто приложение поможет вам сохранять и организовывать ваши фото, видео и файлы в личном облачном хранилище.\n\nДля начала работы, пожалуйста, используйте команду /login чтобы войти в свой аккаунт.';

    tgBotController.useUtil('sendMessage', chatId, welcomeMessage)
};
