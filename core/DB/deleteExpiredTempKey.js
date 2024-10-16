const sysController = require('../systemController')

module.exports = (db, key) => {
    return new Promise(async resolve => {
        db.run(`DELETE FROM temp_keys WHERE key = ?`,
            [key],
            err => {
                resolve(new sysController.createResponse(
                    's',
                    `Успешно удалён временный ключ поста`,
                    {},
                    err,
                    `Ошибка удаления временного ключа`
                ))
            })
    })
}