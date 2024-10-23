const sysController = require('../systemController')

module.exports = (db, id) => {
    return new Promise(async resolve => {
        db.get(`SELECT * FROM posts_groups WHERE id = ?`,
            [id],
            (err, row) => {
                if (!row) {
                    resolve(new sysController.createResponse(
                        'e',
                        `{{S_DB_GPGID_NG_F}}:${id} {{S_DB_GPGID_NG_S}}!`,
                    ))
                } else {
                    row.group = JSON.parse(row.group)
                    const rsp = new sysController.createResponse(
                        's',
                        `{{S_DB_GPGID_S}}:${id}`,
                        { group: row },
                        err,
                        `{{S_DB_GPGID_E}}:${id}`
                    )
                    resolve(rsp)
                    if (rsp.isErr()) {
                        sysController.log(rsp.rslt + '/' + rsp.msg)
                    }
                }
            })
    })
}