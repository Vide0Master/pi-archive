const sysController = require('../systemController')

module.exports = (db, fileName, fileSize, user) => {
    return new Promise(async resolve => {
        db.run(`INSERT INTO posts('size', 'file', 'timestamp', 'author') VALUES(?, ?, ?, ?)`,
            [JSON.stringify(fileSize), fileName, Date.now(), user.login],
            (err) => {
                if (err) {
                    resolve({ rslt: 'e', msg: err })
                } else {
                    db.get(`SELECT * FROM posts WHERE file = '${fileName}'`, (err, row) => {
                        if (err) {
                            resolve({ rslt: 'e', msg: err })
                        } else {
                            resolve({ rslt: 's', id: row.id })
                        }
                    })
                }
            })
    })
}