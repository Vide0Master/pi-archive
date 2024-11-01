const fs = require('fs');

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

        const fstream = fs.createReadStream(media)

        if (type === 'photo') {
            await bot.sendPhoto(chatId, fstream, messageOptions);
        } else if (type === 'video') {
            await bot.sendVideo(chatId, fstream, messageOptions);
        } else if (type === 'document') {
            await bot.sendDocument(chatId, fstream, messageOptions);
        } else {
            console.error(`Unsupported file type: ${type}`);
        }
    }
};