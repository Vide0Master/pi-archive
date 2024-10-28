// utils/sendMessage.js
module.exports = async (bot, chatId, text, replyToMessageId = null, buttons = []) => {
    try {
        const options = {
            ...replyToMessageId && { reply_to_message_id: replyToMessageId },
            ...buttons.length > 0 && {
                reply_markup: {
                    inline_keyboard: [buttons.map((button) => ({
                        text: button.text,
                        callback_data: button.data
                    }))]
                }
            }
        };

        const sentMessage = await bot.sendMessage(chatId, text, options);

        // Return the ID of the sent message
        return sentMessage.message_id;
    } catch (error) {
        console.error('Error sending message:', error);
    }
};
