const cmd = require('./core/consoleLogger.js')

const cfg = require('./config.json')

for (const ver in cfg.vesion) {
    cmd(cfg.vesion[ver], [{ txt: ver + '-V', txtc: 'cyan', txtb: 'magenta' }])
}

const hlthPREP = { txt: 'HEALTH', txtb: 'white', txtc: 'brightGreen' }

cmd('w/Starting health check!', [hlthPREP])
let healthCheckErrors = 0
const fs = require('fs')
const path = require('path')
function FSExist(name) {
    return fs.existsSync(path.join(__dirname, name))
}
if (!FSExist('/storage')) {
    cmd('ce/Storage folder is missing!', [hlthPREP])
    fs.mkdirSync(path.join(__dirname, '/storage'))
    healthCheckErrors++
}
if (!FSExist('/storage/data.db')) {
    cmd('ce/Database is missing!', [hlthPREP])
    fs.copyFileSync('./core/template.db', './storage/data.db')
    healthCheckErrors++
}
if (!FSExist('/storage/file_storage')) {
    cmd('ce/Posts folder is missing!', [hlthPREP])
    fs.mkdirSync(path.join(__dirname, '/storage/file_storage'))
    healthCheckErrors++
}
if (!FSExist('/storage/video_thumbnails')) {
    cmd('e/Video thumbnails folder is missing!', [hlthPREP])
    fs.mkdirSync(path.join(__dirname, '/storage/video_thumbnails'))
    healthCheckErrors++
}
if (!FSExist('/storage/UNLINKED')) {
    cmd('e/unlinked files folder is missing!', [hlthPREP])
    fs.mkdirSync(path.join(__dirname, '/storage/UNLINKED'))
    healthCheckErrors++
}
cmd('i/End of health check!', [hlthPREP])
if (healthCheckErrors > 0) {
    cmd(`w/Fixed ${healthCheckErrors} issues`, [hlthPREP])
} else {
    cmd(`s/No issues detected`, [hlthPREP])
}

//starting web service
require('./webpage/index.js')

//starting tg bot
require('./tg_bot/index.js')

