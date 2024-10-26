const sysController = require('../systemController')

module.exports = (db, postID) => {
    return new Promise(async resolve => {
        db.all(`SELECT likes, dislikes, favs FROM users`,
            (err, rows) => {
                if (err) {
                    resolve(new sysController.createResponse(
                        'e',
                        `Error getting data of post ${postID}`
                    ))
                    return
                }
                if (rows.length > 0) {
                    for (const row of rows) {
                        for (const itm in row) {
                            row[itm] = JSON.parse(row[itm])
                        }
                    }
                    const scores = { likes: 0, dislikes: 0, favs: 0 }
                    for (const usr_scores of rows) {
                        if (usr_scores.likes.includes(postID)) {
                            scores.likes++
                        }
                        if (usr_scores.dislikes.includes(postID)) {
                            scores.dislikes++
                        }
                        if (usr_scores.favs.includes(postID)) {
                            scores.favs++
                        }
                    }
                    resolve(new sysController.createResponse(
                        's',
                        `Got data of post ${postID}`,
                        { scores: scores }
                    ))
                } else {
                    resolve(new sysController.createResponse(
                        'e',
                        `Zero users in database... how you got here?...`,
                    ))
                    sysController.log('ce/NO USERS IN DB, WHAT!?!?!?!?!?!?')
                }
            })
    })
}