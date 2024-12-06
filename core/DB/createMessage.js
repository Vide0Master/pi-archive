
//создание сообщения
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
                    if (err) {
                        resolve(new sysController.createResponse(
                            'e',
                            `Error creating message [${msgDataToDB.from}>${msgDataToDB.to}]: ` + err
                        ))
                        return
                    }
                    db.get(`SELECT messageid FROM messages WHERE timestamp = ?`, [msgDataToDB.timestamp], (err, row) => {
                        if (!err) {
                            msgDataToDB.messageid = row.messageid
                        }
                        resolve(new sysController.createResponse(
                            's',
                            `Message created [${msgDataToDB.from}>${msgDataToDB.to}]`,
                            { message: msgDataToDB },
                            err,
                            `Error getting message id [${msgDataToDB.from}>${msgDataToDB.to}]`
                        ))
                    })
                }
            )
        })

        resolve(rslt)
    })
}