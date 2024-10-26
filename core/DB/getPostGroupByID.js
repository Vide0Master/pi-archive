const sysController = require('../systemController')

module.exports = (db, id) => {
    return new Promise(async resolve => {
        db.get(`SELECT * FROM posts_groups WHERE id = ?`,
            [id],
            (err, row) => {
                if (!row) {
                    resolve(new sysController.createResponse(
                        'e',
                        `Post group ID:${id} is missing from DB!`,
                    ))
                } else {
                    row.group = JSON.parse(row.group)
                    const rsp = new sysController.createResponse(
                        's',
                        `Got post group ID:${id}`,
                        { group: row },
                        err,
                        `Error while getting post group ID:${id}`
                    )
                    resolve(rsp)
                    if (rsp.rslt=='e') {
                        sysController.log(rsp.rslt + '/' + rsp.msg)
                    }
                }
            })
    })
}