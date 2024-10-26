const sysController = require('../systemController')

module.exports = (db, groupName, groupPosts, owner) => {
    return new Promise(async resolve => {
        db.run(`INSERT INTO posts_groups
            ('group','name', 'owner')
            VALUES (?, ?, ?)`,
            [JSON.stringify(groupPosts), groupName, owner],
            (err) => {
                resolve(new sysController.createResponse(
                    's',
                    `Create group [${groupName}]`,
                    {},
                    err,
                    `Error while creating group [${groupName}]`
                ))
            })
    })
}