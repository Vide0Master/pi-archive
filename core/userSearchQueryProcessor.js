module.exports = function (textQuery = '', from, count, ignoreGroupLimit = false) {
    textQuery = textQuery.trim().split(/\s/).filter(val => val !== '');
    let DBquery = '';

    // Если не игнорируем лимит групп
    if (!ignoreGroupLimit) {
        DBquery += `
    FROM (
    SELECT p.*, 
           ROW_NUMBER() OVER (PARTITION BY pg."group" ORDER BY p.id) AS row_num,
           NULL AS group_id -- Добавляем поле group_id для соответствия
    FROM posts p
    LEFT JOIN posts_groups pg ON json_each.value = p.id
    , json_each(pg."group")
    WHERE pg."group" IS NOT NULL

    UNION ALL

    SELECT p.*, NULL AS row_num, NULL AS group_id
    FROM posts p
    WHERE NOT EXISTS (
        SELECT 1
        FROM posts_groups pg, json_each(pg."group")
        WHERE json_each.value = p.id
    )
) AS combined_posts
WHERE (row_num <= 5 OR row_num IS NULL)`;

    } else {
        DBquery += ' FROM posts';
    }

    let params = [];
    let customOrder = '';

    
    if (textQuery.length > 0) {
        try {
            if (!ignoreGroupLimit) {
                DBquery += ' AND ';
            } else {
                DBquery += ' WHERE ';
            }

            const queryArray = [];
            for (const task of textQuery) {
                const qLine = { fp: "", sp: "" };
                const isNegative = task.startsWith('-');
                const tagName = isNegative ? task.slice(1) : task;

                const tfs = (tag) => tagName.startsWith(tag);

                switch (true) {
                    case tfs("author:"): {
                        qLine.fp = `"author"`;
                        qLine.sp = `LIKE ?`;
                        params.push(`${tagName.split(':')[1]}`);
                    }; break;
                    case tfs('id:'): {
                        qLine.fp = `"id"`;
                        const postIDs = tagName.split(':')[1].split(',');
                        qLine.sp = `IN (${postIDs.map(() => `?`).join(', ')})`;
                        postIDs.map(v => params.push(parseInt(v)));

                        if (postIDs.length > 1 && !isNegative) {
                            let order = ' ORDER BY CASE "id" ';
                            order += postIDs.map((v, i) => `WHEN ${v} THEN ${i + 1}`).join(' ');
                            order += " END";
                            customOrder = order;
                        }
                    }; break;
                    default: {
                        qLine.fp = `tags`;
                        qLine.sp = `LIKE ?`;
                        params.push(`%"${tagName}"%`);
                    }; break;
                }

                queryArray.push(isNegative ? `${qLine.fp} NOT ${qLine.sp}` : `${qLine.fp} ${qLine.sp}`);
            }

            DBquery += queryArray.join(' AND ');
        } catch (err) {
            console.log(err);
            return { rslt: 'e', msg: err };
        }
    }

    if (customOrder !== '') {
        DBquery += customOrder;
    } else {
        DBquery += ' ORDER BY id DESC';
    }

    // Ограничения на количество постов и смещение
    if (count) {
        DBquery += ' LIMIT ?';
        params.push(count);
    }
    if (from) {
        DBquery += ' OFFSET ?';
        params.push(from);
    }

    return { Cquery: DBquery, params };
};
