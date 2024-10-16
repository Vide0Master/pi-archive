const consoleLogger = require('../consoleLogger')

module.exports = (db, tags = [], blacklist = []) => {
    return new Promise((resolve) => {
        // Создание SQL-запроса с условиями LIKE, NOT LIKE и параметрами LIMIT и OFFSET
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

        // Выполнение запроса
        db.get(query, params, (err, row) => {
            if (err) {
                resolve({ rslt: 'e', msg: err });
                consoleLogger(`e/Ошибка получения количества постов[getPostCount]: ${err}`);
                console.log(err)
            } else {
                resolve(row.count);
            }
        });
    });
}
