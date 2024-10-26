const cmd = require('./core/consoleLogger.js')

const cfg = require('./config.json')

for (const ver in cfg.vesion) {
    cmd(cfg.vesion[ver], [{ txt: ver + '-V', txtc: 'cyan', txtb: 'magenta' }])
}

cmd('w/Starting health check!')
let healthCheckErrors = 0
const fs = require('fs')
const path = require('path')
function FSExist(name) {
    return fs.existsSync(path.join(__dirname, name))
}
if (!FSExist('/storage')) {
    cmd('ce/Storage folder is missing!')
    fs.mkdirSync(path.join(__dirname, '/storage'))
    healthCheckErrors++
}
if (!FSExist('/storage/data.db')) {
    cmd('ce/Database is missing!')
    fs.copyFileSync('./core/template.db', './storage/data.db')
    healthCheckErrors++
}
if (!FSExist('/storage/file_storage')) {
    cmd('ce/Posts folder is missing!')
    fs.mkdirSync(path.join(__dirname, '/storage/file_storage'))
    healthCheckErrors++
}
if (!FSExist('/storage/video_thumbnails')) {
    cmd('e/Video thumbnails folder is missing!')
    fs.mkdirSync(path.join(__dirname, '/storage/video_thumbnails'))
    healthCheckErrors++
}
if (!FSExist('/storage/UNLINKED')) {
    cmd('e/unlinked files folder is missing!')
    fs.mkdirSync(path.join(__dirname, '/storage/UNLINKED'))
    healthCheckErrors++
}
cmd('i/End of health check!')
if (healthCheckErrors > 0) {
    cmd(`w/Fixed ${healthCheckErrors} issues`)
} else {
    cmd(`s/No issues detected`)
}

//starting web service
require('./webpage/index.js')

//starting tg bot
//require('./tg_bot/index.js')

