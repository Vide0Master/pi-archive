
//создание сообщения

const consoleLogger = require('../consoleLogger.js')
const sysController = require('../systemController.js')

module.exports = (db, messageData) => {
    return new Promise(async resolve => {
        const rslt = await new Promise((resolve) => {
            const msgDataToDB = {
                message: messageData.message,
                from: messageData.from,
                to: messageData.to,
                timestamp: Date.now(),
                msgtype: messageData.msgtype,
                specialdata: (!!messageData.specialdata ? JSON.stringify(messageData.specialdata) : "{}")
            }
            db.run(`INSERT INTO messages('message', 'from', 'to', 'timestamp',  'msgtype', 'specialdata') VALUES(?,?,?,?,?,?)`, [
                msgDataToDB.message,
                msgDataToDB.from,
                msgDataToDB.to,
                msgDataToDB.timestamp,
                msgDataToDB.msgtype,
                msgDataToDB.specialdata
            ],
                (err) => {
                    resolve(new sysController.createResponse(
                        's',
                        `Message created [${messageData.from}>${messageData.to}]`,
                        { message: msgDataToDB },
                        err,
                        `Error while creating message [${messageData.from}>${messageData.to}]`
                    ))
                })
        })

        resolve(rslt)
    })
}