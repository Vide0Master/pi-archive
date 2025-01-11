const sysController = require('../systemController')

module.exports = (db, postID) => {
    return new Promise(async resolve => {
        db.all('SELECT * FROM flags WHERE "reference" = ? ORDER BY id DESC', ['POST:' + postID], (err, rows) => {
            if(!err){
                for(const rowI in rows){
                    rows[rowI].flagdata=JSON.parse(rows[rowI].flagdata)
                }
            }
            resolve(new sysController.createResponse(
                's',
                `Got post ${postID} flags`,
                { flags: rows },
                err,
                `Error getting post ${postID} flags`
            ))
        })
    })
}