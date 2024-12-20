const SysController = require('../systemController')

module.exports = (db, userKey, blacklist) => {
    return new Promise(async resolve => {
        db.run(
            `UPDATE users SET blacklist = ? WHERE auth_key = ?`,
            [JSON.stringify(blacklist), userKey],
            (err) => {
                resolve(new SysController.createResponse(
                    's',
                    `Blacklist updates, new blacklist size: ${blacklist.length}`,
                    {},
                    err,
                    'Error updating blacklist'
                ))
            })
    })
}