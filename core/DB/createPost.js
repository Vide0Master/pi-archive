const sysController = require('../systemController')

module.exports = (db, fileName, fileSize, user) => {
    return new Promise(async resolve => {
        db.run(`INSERT INTO posts('size', 'file', 'timestamp', 'author') VALUES(?, ?, ?, ?)`,
            [JSON.stringify(fileSize), fileName, Date.now(), user.login],
            (err) => {
                if (err) {
                    resolve(new sysController.createResponse(
                        '',
                        '',
                        {},
                        err,
                        '{{S_DB_CP_EWM}}'
                    ))
                } else {
                    db.get(`SELECT * FROM posts WHERE file = '${fileName}'`, (err, row) => {
                        resolve(new sysController.createResponse(
                            's',
                            '{{S_DB_CP_GPID_S}}',
                            { id: row.id },
                            err,
                            '{{S_DB_CP_GPID_S}}'
                        ))
                    })
                }
            })
    })
}