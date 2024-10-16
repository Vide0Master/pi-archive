
//получение динамической конфигурации

const consoleLogger = require('../consoleLogger.js')

module.exports = (db) => {
    return new Promise(async resolve => {
        //запрос на таблицу конфигурации
        const rslt = await new Promise((resolve) => {
            db.all(`SELECT * FROM config`, (err, rows) => {
                if (err) {
                    resolve({ rslt: 'e', msg: err })
                } else {
                    resolve(rows)
                }
            })
        })
        if (rslt.rslt == 'e') {
            //если ошибка
            consoleLogger(`e/Ошибка получения конфугирации: ${rslt.msg}`)
            resolve('e')
        } else {
            //если всё ок, создать объект и перенести всё из обычного массива в объект
            const cfg = {}
            for (const record of rslt) {
                cfg[record.key] = record.value
            }
            //и вернуть его
            resolve(cfg)
        }
    })
}