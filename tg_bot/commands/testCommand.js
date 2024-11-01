const tgBotController = require('../tgBotController');
const sysController = tgBotController.sysController
const path = require('path')

module.exports = async (bot, chatId, msgId, userdata, ...args) => {

    tgBotController.useUtil('sendFile', chatId, null, [{ type: 'document', media: path.join(__dirname, '../../storage/file_storage/TGBOT-0JR5STlzrN-1720474286211.jpg') }])

};
