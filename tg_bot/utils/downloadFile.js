const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.downloadFile = async (bot, fileId, downloadDir) => {
    const file = await bot.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;

    const fileName = path.basename(file.file_path);
    const fullPath = path.join(downloadDir, fileName);

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