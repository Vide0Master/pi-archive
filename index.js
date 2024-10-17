const cmd = require('./core/consoleLogger.js')
cmd('i/Starting health check!')
const health_stats = {
    isStorageFolderMissing: false,
    isPostsFolderMissing: false,
    isMissingDatabase: false,
    isMissingVideoThumbnails: false
}
const fs = require('fs')
const path = require('path')
function FSExist(name) {
    return fs.existsSync(path.join(__dirname, name))
}
if (!FSExist('/storage')) {
    cmd('ce/Storage folder is missing!')
    health_stats.isStorageFolderMissing = true
}
if (!FSExist('/storage/file_storage')) {
    cmd('ce/Posts folder is missing!')
    health_stats.isPostsFolderMissing = true
}
if (!FSExist('/storage/data.db')) {
    cmd('ce/Database is missing!')
    health_stats.isMissingDatabase = true
}
if (!FSExist('/storage/video_thumbnails')) {
    cmd('e/Video thumbnails folder is missing!')
    health_stats.isMissingVideoThumbnails = true 
}

//запуск веб-системы
require('./webpage/index.js')

//запуск телеграм бота
require('./tg_bot/index.js')