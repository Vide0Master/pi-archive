
module.exports = function (whitelist = [], blacklist = [], from, count) {
    let query = ''
    let params = []

    if (whitelist.length > 0 || blacklist.length > 0) {
        try {
            query += ' WHERE '
            const queryArray = []
            for (const tag of whitelist) {
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
    
    if (count) {
        query += ' LIMIT ?'
        params.push(count);
    }
    if (from) {
        query += ' OFFSET ?'
        params.push(from);
    }

    return { Cquery: query, params }
}