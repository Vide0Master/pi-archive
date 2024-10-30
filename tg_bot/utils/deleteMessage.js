// utils/sendMessage.js
module.exports = async (bot, chatId, messageId) => {
    try {
        await bot.deleteMessage(chatId, messageId);
    } catch (error) {
        console.error('Error deleting message:', error);
    }
};
