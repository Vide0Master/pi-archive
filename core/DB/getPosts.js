const SysController = require('../systemController');

module.exports = (db, tags = [], blacklist = [], from, posts) => {
    return new Promise((resolve) => {
        let query = 'SELECT * FROM posts';
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

        query += ' ORDER BY id DESC'
        query += ' LIMIT ? OFFSET ?';
        params.push(posts, from);

        db.all(query, params, (err, rows) => {
            resolve(new SysController.createResponse(
                's',
                'Got post list',
                { posts: rows },
                err,
                'Error getting posts list'
            ))
        });
    });
};