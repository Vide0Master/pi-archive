const sysController = require('../core/systemController.js')
const TelegramBot = require('node-telegram-bot-api');

sysController.log('i/Starting Telegram bot')

const token = sysController.config.private.telegram_bot.token

const bot = new TelegramBot(token, { polling: true });

bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, 'Telegram bot is not available in this version\nFunctionality will be restored in next updates, stay tuned!');
});