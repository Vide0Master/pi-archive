const sysController = require('../core/systemController.js')
const TelegramBot = require('node-telegram-bot-api');

sysController.log('i/Starting Telegram bot')

const token = sysController.config.private.telegram_bot.token

const bot = new TelegramBot(token, { polling: true });

const fs = require('fs');
const path = require('path');
const { downloadFile } = require('./utils/downloadFile');
const { sendMessage } = require('./utils/sendMessage');

const downloadPath = path.join(__dirname, '../storage/file_storage');

const commandsPath = path.join(__dirname, 'commands');
fs.readdirSync(commandsPath).forEach(file => {
    const command = require(`./commands/${file}`);
    bot.onText(new RegExp(`/${file.split('.')[0]}`), (msg) => command(bot, msg));
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    if(!(msg.photo||msg.video||msg.document)){
        return
    }

    if (msg.photo) {
        const fileId = msg.photo[msg.photo.length - 1].file_id; // Берем фото с максимальным разрешением
        const filePath = await downloadFile(bot, fileId, downloadPath);
        sendMessage(bot, chatId, `Фото сохранено по пути: ${filePath}`, messageId);

    } else if (msg.video) {
        const fileId = msg.video.file_id;
        const filePath = await downloadFile(bot, fileId, downloadPath);
        sendMessage(bot, chatId, `Видео сохранено по пути: ${filePath}`, messageId);

    } else if (msg.document && msg.document.mime_type.startsWith('image/')) {
        const fileId = msg.document.file_id;
        const filePath = await downloadFile(bot, fileId, downloadPath);
        sendMessage(bot, chatId, `Изображение сохранено по пути: ${filePath}`, messageId);

    } else if (msg.document && msg.document.mime_type === 'video/mp4') {
        const fileId = msg.document.file_id;
        const filePath = await downloadFile(bot, fileId, downloadPath);
        sendMessage(bot, chatId, `GIF сохранен по пути: ${filePath}`, messageId);
    } else {
        sendMessage(bot, chatId, 'Этот формат файла не поддерживается.', messageId);
    }
});