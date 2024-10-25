// utils/sendMessage.js
module.exports.sendMessage = async (bot, chatId, text, replyToMessageId = null) => {
    try {
        const options = replyToMessageId ? { reply_to_message_id: replyToMessageId } : {};
        const sentMessage = await bot.sendMessage(chatId, text, options);

        // Возвращаем ID отправленного сообщения
        return sentMessage.message_id;
    } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
    }
};
