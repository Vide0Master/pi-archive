// commands/start.js

// Экспортируем функцию, которая будет вызвана при выполнении команды
module.exports = (bot, msg) => {
    const chatId = msg.chat.id;

    // Сообщение, которое отправит бот в ответ на команду /start
    const welcomeMessage = 'Добро пожаловать в PI Archive! Я помогу вам сохранять и организовывать ваши фото, видео и файлы.';

    // Используем универсальную функцию для отправки сообщения
    bot.sendMessage(chatId, welcomeMessage)
        .then(sentMessage => {
            console.log(`Отправлено приветственное сообщение с ID: ${sentMessage.message_id}`);
        })
        .catch(error => console.error('Ошибка при отправке сообщения:', error));
};
