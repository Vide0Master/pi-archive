
//создание сообщения

const consoleLogger = require('../consoleLogger.js')
const sysController = require('../systemController.js')

module.exports = (db, messageData) => {
    return new Promise(async resolve => {
        const rslt = await new Promise((resolve) => {

            db.run(`INSERT INTO messages('message', 'from', 'to', 'timestamp',  'msgtype', 'specialdata') VALUES(?,?,?,?,?,?)`,
                [messageData.message,
                messageData.from,
                messageData.to,
                Date.now(),
                messageData.msgtype,
                (!!messageData.specialData ? JSON.stringify(messageData.specialData) : "{}")
                ],
                (err) => {
                    resolve(new sysController.createResponse(
                        's',
                        `Message created [${messageData.from}>${messageData.to}]`,
                        {},
                        err,
                        `Error while creating message [${messageData.from}>${messageData.to}]`
                    ))
                })
        })
        
        resolve(rslt)
    })
}