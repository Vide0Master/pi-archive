const sysController = require('../systemController')

module.exports = (db, key) => {
    return new Promise(async resolve => {
        db.get(`SELECT * FROM temp_keys WHERE key = ?`,
            [key],
            (err, row) => {
                resolve(new sysController.createResponse(
                    's',
                    `Успешно получен временный ключ`,
                    { data: row },
                    err,
                    `Ошибка получения временного ключа`
                ))
            })
    })
}