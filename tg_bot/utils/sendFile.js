const fs = require('fs');
const path = require('path');
const tgBotController = require('../tgBotController')

module.exports = async (bot, chatId, msgId, files, options = {}) => {
    const { caption = '', buttons = [] } = options;

    for (const file of files) {
        const { type, media } = file;

        const messageOptions = {
            caption: caption,
            reply_markup: {
                inline_keyboard: buttons
            }
        };

        if (type === 'photo') {
            await bot.sendPhoto(chatId, media, messageOptions);
        } else if (type === 'video') {
            await bot.sendVideo(chatId, media, messageOptions);
        } else if (type === 'document') {
            await bot.sendDocument(chatId, media, messageOptions);
        } else {
            console.error(`Unsupported file type: ${type}`);
        }
    }
};