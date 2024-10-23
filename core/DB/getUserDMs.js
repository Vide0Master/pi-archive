const sysController = require('../systemController')

module.exports = (db, user) => {
    return new Promise(async resolve => {
        db.all(`
            SELECT "to", "from" FROM messages 
            WHERE ("to" = ? OR "from" = ?) AND "msgtype" = "DM"
            ORDER BY timestamp DESC`,
            [user, user],
            (err, rows) => {
                if(err){
                    resolve(new sysController.createResponse(
                        '',
                        '',
                        {},
                        err,
                        '{{S_DB_GUD_E}} ${user}'
                    ))
                    return
                }
                
                const logins = new Set();
                rows.forEach(row => {
                    if (row.to === user) {
                        logins.add(row.from);
                    } else if (row.from === user) {
                        logins.add(row.to);
                    }
                });

                resolve(new sysController.createResponse(
                    's',
                    `{{S_DB_GUD_S}} ${user}`,
                    { loginsList: [...logins] }
                ))
            }
        );
    });
}
