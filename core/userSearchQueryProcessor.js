
module.exports = function (textQuery = '', from, count) {
    textQuery = textQuery.trim().split(/\s/).filter(val => val !== '')
    let DBquery = ''
    let params = []

    let customOrder = ''

    if (textQuery.length > 0) {
        try {
            DBquery += ' WHERE '
            const queryArray = []
            for (const task of textQuery) {
                const qLine = { fp: "", sp: "" }
                const isNegative = task.startsWith('-')
                const tagName = isNegative ? task.slice(1) : task

                const tfs = (tag) => tagName.startsWith(tag)

                switch (true) {
                    case tfs("author:"): {
                        qLine.fp = `"author"`
                        qLine.sp = `LIKE ?`
                        params.push(`${tagName.split(':')[1]}`)
                    }; break;
                    case tfs('id:'): {
                        qLine.fp = `"id"`
                        const postIDs = tagName.split(':')[1].split(',')
                        qLine.sp = `IN (${postIDs.map(() => `?`).join(', ')})`
                        postIDs.map(v => params.push(parseInt(v)))

                        if (postIDs.length > 1 && !isNegative) {
                            let order = ' ORDER BY CASE "id" '
                            order += postIDs.map((v, i) => `WHEN ${v} THEN ${i + 1}`).join(' ')
                            order += " END"
                            customOrder = order
                        }
                    }; break;
                    default: {
                        qLine.fp = `tags`
                        qLine.sp = `LIKE ?`
                        params.push(`%${tagName}%`)
                    }; break;
                }

                queryArray.push(isNegative ? `${qLine.fp} NOT ${qLine.sp}` : `${qLine.fp} ${qLine.sp}`)
            }

            DBquery += queryArray.join(' AND ');
        } catch (err) {
            console.log(err)
            return { rslt: 'e', msg: err }
        }
    }

    if (customOrder != '') {
        DBquery += customOrder
    } else {
        DBquery += ' ORDER BY id DESC'
    }

    if (count) {
        DBquery += ' LIMIT ?'
        params.push(count);
    }
    if (from) {
        DBquery += ' OFFSET ?'
        params.push(from);
    }

    return { Cquery: DBquery, params }
}