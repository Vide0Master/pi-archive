const sysController = require('../systemController')

module.exports = (db) => {
    return new Promise(async resolve => {

        resolve(new sysController.createResponse(
            's',
            `Успешно`,
            {},
            err,
            `Ошибка`
        ))
    })
}