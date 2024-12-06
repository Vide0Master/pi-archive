const sysController = require('../systemController')

module.exports = (db, postID) => {
    return new Promise(async resolve => {
        db.get(`SELECT * FROM posts_collections WHERE "collection" LIKE ?`,
            [`%"` + postID + `"%`],
            (err, row) => {
                const data = !!row ? { id: row.id, collection: JSON.parse(row.collection).map(value => parseInt(value)), name: row.name } : null

                resolve(new sysController.createResponse(
                    's',
                    `Got group of post [${postID}]`,
                    { data },
                    err,
                    `Error getting group of post [${postID}]`
                ))
            })
    })
}