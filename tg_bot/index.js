const sysController = require('../core/systemController.js');
const TelegramBot = require('node-telegram-bot-api');
const tgBotController = require('./tgBotController.js');

const token = sysController.config.private.telegram_bot.token;
if (token) {
    sysController.log('i/Starting Telegram bot', [{ txt: 'TGBot', txtb: 'blue', txtc: 'white' }]);
} else {
    sysController.log('w/TG bot token not found in config-PRIVATE.json, bot will not be launched', [{ txt: 'TGBot', txtb: 'blue', txtc: 'white' }])
    return
}

const bot = new TelegramBot(token, { polling: true });
tgBotController.initialize(bot);

function parseCommand(message) {
    if (!message) return { command: '', args: [] };
    const parts = message.trim().split(/\s+/);
    const command = parts[0].startsWith("/") ? parts[0].slice(1) : parts[0];
    return { command, args: parts.slice(1) };
}

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userData = (await tgBotController.getUserByTGID(chatId))
    const lpack = tgBotController.getUserLang(userData.user)

    if (msg.photo || msg.video || msg.document) {
        if (!userData.user) {
            tgBotController.sendMessage(chatId, lpack.noLogin)
            return
        }

        let fileId;
        if (msg.photo) {
            if (msg.photo[msg.photo.length - 1].file_size > 20971520) {
                await tgBotController.sendMessage(chatId, lpack.uploadErr.img, msg.message_id);
                return
            }
            fileId = msg.photo[msg.photo.length - 1].file_id;
        } else if (msg.video) {
            if (msg.video.file_size > 20971520) {
                await tgBotController.sendMessage(chatId, lpack.uploadErr.vid, msg.message_id);
                return
            }
            fileId = msg.video.file_id;
        } else if (msg.document && msg.document.mime_type.startsWith('image/')) {
            if (msg.document.file_size > 20971520) {
                await tgBotController.sendMessage(chatId, lpack.uploadErr.img, msg.message_id);
                return
            }
            fileId = msg.document.file_id;
        } else if (msg.document && msg.document.mime_type.startsWith('video')) {
            if (msg.document.file_size > 20971520) {
                await tgBotController.sendMessage(chatId, lpack.uploadErr.vid, msg.message_id);
                return
            }
            fileId = msg.document.file_id;
        } else {
            await tgBotController.sendMessage(chatId, result.msg, msg.message_id, lpack.uploadErr.noSupp);
            return
        }
        const filePath = await tgBotController.useUtil('downloadFile', fileId)
        const result = await sysController.fileProcessor(filePath, { type: 'TGBOT', key: chatId });
        const options =
            new tgBotController.inlineConstr([
                { text: lpack.msgButtons.addPostTags, data: `addTags:${result.postID}` },
                { text: lpack.msgButtons.setPostDesc, data: `setDesc:${result.postID}` },
            ])
        tgBotController.sendMessage(chatId, result.msg, msg.message_id, options);
        return
    }

    if (tgBotController.followups[chatId]) {
        if (!userData.user) {
            tgBotController.sendMessage(chatId, lpack.noLogin)
            return
        }

        tgBotController.executeFollowup(
            tgBotController.followups[chatId].type,
            chatId,
            msg.message_id,
            userData.user,
            tgBotController.followups[chatId].data,
            msg.text
        )
        return
    }

    if (msg.text) {
        const { command, args } = parseCommand(msg.text);
        if (sysController.config.static.restrictions.tgbotfunctions[command] > 0 && !userData.user) {
            tgBotController.sendMessage(chatId, lpack.noLogin, msg.message_id);
            return
        }
        if (sysController.config.static.restrictions.tgbotfunctions[command] > sysController.config.static.user_status[(userData.user || { status: 'unconfirmed' }).status]) {
            tgBotController.sendMessage(chatId, lpack.noPerm, msg.message_id);
            return
        }

        tgBotController.executeCommand(command, chatId, msg.message_id, userData.user, ...args);
    }
});

sysController.log('s/Telegram bot strted', [{ txt: 'TGBot', txtb: 'blue', txtc: 'white' }])