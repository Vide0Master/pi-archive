const sysController = require('../systemController')

module.exports = (db, fileName, fileSize, user) => {
    return new Promise(async resolve => {
        db.run(`INSERT INTO posts('size', 'file', 'timestamp', 'author') VALUES(?, ?, ?, ?)`,
            [JSON.stringify(fileSize), fileName, Date.now(), user],
            (err) => {
                if (err) {
                    resolve(new sysController.createResponse(
                        '',
                        '',
                        {},
                        err,
                        'Error creating post'
                    ))
                } else {
                    db.get(`SELECT * FROM posts WHERE file = '${fileName}'`, (err, row) => {
                        resolve(new sysController.createResponse(
                            's',
                            'Post created, heres ID',
                            { id: row.id },
                            err,
                            'Post created, heres ID'
                        ))
                    })
                }
            })
    })
}