const consoleLogger = require('../systemController').log

module.exports = (db, tags = [], blacklist = [], from, posts) => {
    return new Promise((resolve) => {
        // Создание SQL-запроса с условиями LIKE, NOT LIKE и параметрами LIMIT и OFFSET
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

        // Выполнение запроса
        db.all(query, params, (err, rows) => {
            if (err) {
                resolve({ rslt: 'e', msg: `e/Ошибка запроса базы данных [getPosts]: ${err}` });
                consoleLogger(`e/Ошибка запроса базы данных [getPosts]: ${err}`);
                console.log(err)
            } else {
                resolve(rows);
            }
        });
    });
};