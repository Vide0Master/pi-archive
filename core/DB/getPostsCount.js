const consoleLogger = require('../consoleLogger');
const SysController = require('../systemController');

module.exports = (db, tags = [], blacklist = []) => {
    return new Promise((resolve) => {
        let query = 'SELECT COUNT(*) as count FROM posts';
        let params = []

        if (tags.length > 0 || blacklist.length > 0) {
            try {
                query += ' WHERE '
                const queryArray = []
                for (const tag of tags) {
                    switch (true) {
                        case tag.startsWith("author:"): {
                            queryArray.push('"author" LIKE ?')
                            params.push(`${tag.split(':')[1]}`)
                        }; break;
                        default: {
                            queryArray.push('tags LIKE ?')
                            params.push(`%${tag}%`)
                        }; break;
                    }
                }
                for (const antiTag of blacklist) {
                    switch (true) {
                        case antiTag.startsWith("author:"): {
                            queryArray.push('"author" NOT LIKE ?')
                            params.push(`${antiTag.split(':')[1]}`)
                        }; break;
                        default: {
                            queryArray.push('tags NOT LIKE ?')
                            params.push(`%${antiTag}%`)
                        }; break;
                    }
                }
                query += queryArray.join(' AND ');
            } catch (err) {
                resolve({ rslt: 'e', msg: err })
                return
            }
        }

        db.get(query, params, (err, row) => {
            resolve(new SysController.createResponse(
                's',
                '{{S_DB_GPCN_S}}',
                { count: row.count },
                err,
                '{{S_DB_GPCN_E}}'
            ))
        });
    });
}
