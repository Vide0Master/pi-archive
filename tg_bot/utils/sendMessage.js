// utils/sendMessage.js
module.exports = async (bot, chatId, text, replyToMessageId = null, reply_markup = null) => {
    try {
        const options = {
            ...replyToMessageId && { reply_to_message_id: replyToMessageId },
            ...reply_markup,
            parse_mode: 'HTML',
            disable_web_page_preview: true
        };

        const sentMessage = await bot.sendMessage(chatId, text, options);

        // Возвращает ID отправленного сообщения
        return sentMessage.message_id;
    } catch (error) {
        console.error('Error sending message:', error);
    }
};
