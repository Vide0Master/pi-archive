const sysController = require('../core/systemController.js')
const TelegramBot = require('node-telegram-bot-api');
const https = require('https');
const fs = require('fs');
const path = require('path');

sysController.log('i/Запуск телеграм бота')

const token = sysController.config.private.telegram_bot.token

const bot = new TelegramBot(token, { polling: true });

const file_storage_location = '../storage/file_storage'

const API = sysController.APIprocessorTG

const users = {};

(async () => {
    const TGIDauthedUsers = await sysController.dbinteract.getTGAuthedUsers()
    for (const user of TGIDauthedUsers) {
        users[user.tgid] = user
    }
    sysController.log(`i/ТГ бот загрузил ${TGIDauthedUsers.length} пользователей из базы данных.`)
})()

function trimArray(arr, length) {
    if (arr.length > length) {
        arr.length = length;
        return true;
    }
    return false;
}

//Универсальная функция отправки сообщений
async function sendMessage(text, chatID, replyMsgID) {
    return new Promise(async resolve => {
        if (replyMsgID) {
            bot.sendMessage(chatID, text, { reply_to_message_id: replyMsgID, parse_mode: 'HTML' })
                .then(sentMessage => resolve(sentMessage));
        } else {
            bot.sendMessage(chatID, text, { parse_mode: 'HTML' })
                .then(sentMessage => resolve(sentMessage));
        }
    })
}

// Функция для загрузки файла
function downloadFile(url, dest, callback) {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
        response.pipe(file);
    }).on('error', (err) => {
        fs.unlink(dest, () => { }); // Удалить файл при ошибке
        if (callback) callback(err.message);
    });
    file.on('finish', () => {
        file.close(callback);
    });
}

async function handleFile(file, chatId, bot, token, file_storage_location, originaMsgID) {
    const fileUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
    const fileExtension = path.extname(file.file_path).toLowerCase();

    const save_file_name = `TGBOT-${sysController.hashGen(10)}-${Date.now()}`

    const filePath = path.join(__dirname, file_storage_location, save_file_name + fileExtension);

    downloadFile(fileUrl, filePath, async (err) => {
        if (err) {
            sendMessage(`Ошибка: ${err}`, chatId, originaMsgID)
        } else {
            const fileResult = await sysController.fileProcessor(filePath, users[chatId].auth_key)
            sendMessage(fileResult.msg, chatId, originaMsgID)
        }
    });
}

async function handleMessage(msg, userId, chatId, bot, token, file_storage_location) {
    switch (true) {
        case msg.text && msg.text.startsWith('/'):
            const args = msg.text.split(' ')
            const command = args.shift().slice(1)

            switch (command) {
                case 'help': {
                    const commandsList = [
                        '<b>/login</b> ключ_пользователя - позволяет войти в архив под соответствующим пользователем.'
                    ]
                    sendMessage(commandsList.concat('\n')+'', chatId, msg.message_id)
                }; break;
                case 'login': {
                    if (args.length == 0) {
                        sendMessage('Не введён ключ пользователя!', chatId)
                        return
                    }
                    if (args.length > 1) {
                        sendMessage('Введены лишние аргументы, зачем?', chatId)
                    }

                    const result = await API('authTGUser', userId, { userKey: args[0], TGID: userId })
                    sendMessage(result.msg, chatId, msg.message_id)
                    users[userId] = result.userdata


                }; break;
                case 'download': {
                    if (args.length == 0) {
                        sendMessage('Не введён ID поста!', chatId, msg.message_id)
                        return
                    }

                    if (trimArray(args, sysController.config.static.telegram_bot.batchDownloadLimit)) {
                        sendMessage(
                            `Количество загружаемых постов уменьшено, доступный максимум: ${sysController.config.static.telegram_bot.batchDownloadLimit}`,
                            chatId,
                            msg.message_id
                        );
                    }

                    for (const postID of args) {
                        const wait_msg = await sendMessage('Ожидайте...', chatId)

                        const record = await API('getPostData', userId, { id: postID })
                        if (!record.post) {
                            sendMessage(`Поста ${postID} не существует!`, chatId, msg.message_id)
                            continue
                        }
                        if (record.result == 'e') {
                            sendMessage(record.msg, chatId, msg.message_id)
                            continue
                        }

                        let caption = `<b>Пост #${record.post.id}</b>`
                        const tags = record.post.tags
                        if (tags.length > 0) {
                            caption += '\n\n<b>Теги</b>\n'
                            for (const tag of tags) {
                                caption += `#${tag} `
                            }
                        }

                        bot.sendDocument(chatId,
                            fs.createReadStream(
                                path.join(__dirname,
                                    file_storage_location,
                                    record.post.file
                                )
                            ),
                            {
                                caption,
                                reply_to_message_id: msg.message_id,
                                parse_mode: 'HTML'
                            })
                            .catch((error) => {
                                console.error('Error sending file:', error);
                                sendMessage(
                                    `Ошибка отправки поста [${postID}][TGSendPost]: ${error}`,
                                    chatId,
                                    msg.message_id
                                )
                            }).then(() => {
                                bot.deleteMessage(wait_msg.chat.id, wait_msg.message_id)
                            });
                    }
                }; break;
                case 'post': {
                    if (args.length == 0) {
                        sendMessage('Не введён ID поста!', chatId, msg.message_id);
                        return;
                    }

                    if (trimArray(args, sysController.config.static.telegram_bot.batchDownloadLimit)) {
                        sendMessage(
                            `Количество загружаемых постов уменьшено, доступный максимум: ${sysController.config.static.telegram_bot.batchDownloadLimit}`,
                            chatId,
                            msg.message_id
                        );
                    }

                    for (const postID of args) {
                        const wait_msg = await sendMessage('Ожидайте...', chatId)

                        const record = await API('getPostData', userId, { id: postID });
                        if (!record.post) {
                            sendMessage(`Поста ${postID} не существует!`, chatId, msg.message_id);
                            continue
                        }
                        if (record.result == 'e') {
                            sendMessage(record.msg, chatId, msg.message_id);
                            continue
                        }

                        let caption = `<b>Пост #${record.post.id}</b>`;
                        const tags = record.post.tags
                        if (tags.length > 0) {
                            caption += '\n\n<b>Теги</b>\n';
                            for (const tag of tags) {
                                caption += `#${tag} `;
                            }
                        }

                        const filePath = path.join(__dirname, file_storage_location, record.post.file);
                        const ext = path.extname(record.post.file).toLowerCase();

                        const sendMedia = (method) => {
                            bot[method](chatId, fs.createReadStream(filePath), {
                                caption,
                                reply_to_message_id: msg.message_id,
                                parse_mode: 'HTML'
                            })
                                .catch((error) => {
                                    console.error('Error sending file:', error);
                                    sendMessage(
                                        `Ошибка отправки поста [TGSendPost]: ${error}`,
                                        chatId,
                                        msg.message_id
                                    );
                                }).then(() => {
                                    bot.deleteMessage(wait_msg.chat.id, wait_msg.message_id)
                                });
                        };

                        if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
                            sendMedia('sendPhoto');
                        } else if (['.mp4', '.mov', '.avi', '.mkv', '.gif'].includes(ext)) {
                            sendMedia('sendVideo');
                        } else {
                            sendMessage(`Unsupported file type: ${ext}`, chatId, msg.message_id);
                        }
                    }
                }; break;

                default: {
                    sendMessage(`Комманды "${command}" не существует, проверьте список комманд и инструкции.`, chatId, msg.message_id)
                }; break
            }

            break;
        case msg.photo !== undefined && users[userId] !== undefined:
            if (msg.photo.file_size > 20 * 1024 * 1024) {
                sendMessage('Превышен лимит размера отправляемого фото, максимум 20Мб', userId, msg.message_id)
                return
            }
            const photo = msg.photo
            const file = await bot.getFile(photo[photo.length - 1].file_id);
            await handleFile(file, chatId, bot, token, file_storage_location, msg.message_id);
            break;
        case msg.video !== undefined && users[userId] !== undefined:
            if (msg.video.file_size > 20 * 1024 * 1024) {
                sendMessage('Превышен лимит размера отправляемого видео, максимум 20Мб', userId, msg.message_id)
                return
            }
            const videoFile = await bot.getFile(msg.video.file_id);
            await handleFile(videoFile, chatId, bot, token, file_storage_location, msg.message_id);
            break;
        case msg.document !== undefined && users[userId] !== undefined && ['image', 'video'].includes(msg.document.mime_type.split('/')[0]):
            if (msg.document.file_size > 20 * 1024 * 1024) {
                sendMessage('Превышен лимит размера отправляемого файла(фото/видео), максимум 20Мб', userId, msg.message_id)
                return
            }
            const documentFile = await bot.getFile(msg.document.file_id);
            await handleFile(documentFile, chatId, bot, token, file_storage_location, msg.message_id);
            break;
        default:
            bot.sendMessage(chatId, 'Ошибка, проверьте список комманд и инструкции.');
            break;
    }
}

// Обработка сообщений
bot.on('message', async (msg) => {
    // console.log(msg)

    const chatId = msg.chat.id;
    const userId = msg.from.id

    if (users[userId]) {
        users[userId] = await sysController.dbinteract.getUserByTGID(userId)
    }

    await handleMessage(msg, userId, chatId, bot, token, file_storage_location);
});

sysController.TGController = class {
    static sendPost(postID, userID) {
        return new Promise(async resolve => {
            if (!users[userID]) {
                resolve(new sysController.createResponse(
                    'w',
                    'Вы не авторизованы в телеграм боте!'
                ))
                return;
            }

            const record = await API('getPostData', userID, { id: postID })

            if (['e', 'w'].includes(record.rslt)) {
                resolve(record)
                return
            }

            const ext = path.extname(record.post.file).toLowerCase();

            switch (true) {
                case ['.jpg', '.jpeg', '.png', '.webp'].includes(ext): {
                    if (record.post.size.weight > 10 * 1024 * 1024) {
                        resolve(new sysController.createResponse(
                            'w',
                            'Файл слишком большой для отправки, лимит 10мб'
                        ))
                        return
                    }
                }; break;
                case ['.mp4', '.mov', '.avi', '.mkv', '.gif'].includes(ext): {
                    if (record.post.size.weight > 50 * 1024 * 1024) {
                        resolve(new sysController.createResponse(
                            'w',
                            'Файл слишком большой для отправки, лимит 50мб'
                        ))
                        return
                    }
                }; break;
            }

            const wait_msg = await sendMessage('Ожидайте...', userID)

            let caption = `<b>Пост #${record.post.id}</b>`;
            const tags = record.post.tags
            if (tags.length > 0) {
                caption += '\n\n<b>Теги</b>\n';
                for (const tag of tags) {
                    caption += `#${tag} `;
                }
            }

            const filePath = path.join(__dirname, file_storage_location, record.post.file);

            const sendMedia = (method) => {
                bot[method](userID, fs.createReadStream(filePath), {
                    caption,
                    parse_mode: 'HTML'
                })
                    .catch((error) => {
                        console.error('Error sending file:', error);
                        sendMessage(
                            `Ошибка отправки поста [TGSendPost]: ${error}`,
                            userID
                        );
                        resolve({ rslt: 'e', msg: `Ошибка отправки поста: ${error}` });
                    })
                    .then(() => {
                        resolve({ rslt: 's', msg: 'Сообщение с постом отправлено!' });
                        bot.deleteMessage(wait_msg.chat.id, wait_msg.message_id)
                    })
            };

            if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
                sendMedia('sendPhoto');
            } else if (['.mp4', '.mov', '.avi', '.mkv', '.gif'].includes(ext)) {
                sendMedia('sendVideo');
            } else {
                sendMessage(`Unsupported file type: ${ext}`, userID);
                resolve({ rslt: 'e', msg: `Unsupported file type: ${ext}` });
            }
        });
    }

    static sendPostAsFile(postID, userID) {
        return new Promise(async resolve => {
            if (!users[userID]) {
                resolve(new sysController.createResponse(
                    'w',
                    'Вы не авторизованы в телеграм боте!'
                ))
                return;
            }
            
            const record = await API('getPostData', userID, { id: postID })

            if (['e', 'w'].includes(record.rslt)) {
                resolve(record)
                return
            }

            if (record.post.size.weight > 50 * 1024 * 1024) {
                resolve(new sysController.createResponse(
                    'w',
                    'Файл слишком большой для отправки, лимит 50мб'
                ))
                return
            }

            const wait_msg = await sendMessage('Ожидайте...', userID)

            let caption = `<b>Пост #${record.post.id}</b>`
            const tags = record.post.tags
            if (tags.length > 0) {
                caption += '\n\n<b>Теги</b>\n'
                for (const tag of tags) {
                    caption += `#${tag} `
                }
            }

            bot.sendDocument(userID,
                fs.createReadStream(
                    path.join(__dirname,
                        file_storage_location,
                        record.post.file
                    )
                ),
                {
                    caption,
                    parse_mode: 'HTML'
                })
                .catch((error) => {
                    resolve(new sysController.createResponse(
                        'e',
                        '',
                        {},
                        error,
                        `Ошибка отправки поста [${postID}][TGSendPost]: ${error}`
                    ))
                    sendMessage(
                        `Ошибка отправки поста [${postID}][TGSendPost]: ${error}`,
                        userID
                    )
                }).then(() => {
                    resolve(new sysController.createResponse(
                        's',
                        'Файл отправлен!',
                    ));
                    bot.deleteMessage(wait_msg.chat.id, wait_msg.message_id)
                })
        })
    }
}