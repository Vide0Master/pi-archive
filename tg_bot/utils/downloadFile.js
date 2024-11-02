const axios = require('axios');
const fs = require('fs');
const path = require('path');
const downloadDir = '../../storage/file_storage'
const tgBotController = require('../tgBotController')

module.exports = async (bot, fileId) => {
    const file = await bot.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;

    const fileName = path.basename(`TGBOT-${tgBotController.sysController.hashGen(10)}-${Date.now()}${path.extname(file.file_path)}`);
    const fullPath = path.join(__dirname, downloadDir, fileName);

    const response = await axios({
        url: fileUrl,
        method: 'GET',
        responseType: 'stream',
    });

    const writer = fs.createWriteStream(fullPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', () => {
            resolve(fullPath)
        });
        writer.on('error', reject);
    });
};