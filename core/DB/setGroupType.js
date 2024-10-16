const sysController = require('../systemController')

module.exports = (db, groupID, newType) => {
    return new Promise(async resolve => {
        db.run(`UPDATE posts_groups SET type = ? WHERE id = ?`,
            [newType, groupID],
            (err) => {
                if (err) {
                    resolve({ rslt: 'e', msg: err })
                    sysController.log(`e/Ошибка изменения типа группы ID:${groupID}`)
                } else {
                    resolve({ rslt: 's', msg: `Успешно изменен тип группы ID:${groupID}` })
                }
            })
    })
}