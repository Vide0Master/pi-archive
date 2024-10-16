
const SysController = require('../systemController')

module.exports = (db, postID, tags) => {
    return new Promise(async resolve => {
        db.run(`UPDATE posts SET tags = ? WHERE id = ?`,
            [JSON.stringify(tags), postID],
            (err) => {
                if (err) {
                    resolve({ rslt: 'e', msg: `e/Ошибка обновления тегов поста [${postID}] [updateTags]: ${err}` })
                    SysController.log(`e/Ошибка обновления тегов поста [${postID}] [updateTags]: ${err}`)
                } else {
                    resolve({ rslt: 's', msg: `s/Теги успешно изменены!` })
                }
            }
        )
    })
}