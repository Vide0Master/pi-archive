const sysController = require('../systemController')

module.exports = (db, groupName, newGroupData) => {
    return new Promise(async resolve => {
        db.run(`UPDATE tags_groups
            SET groupname = ?, relatedtags = ?, color = ?, priority = ?
            WHERE groupname = ?`,
            [newGroupData.groupname,
            JSON.stringify(newGroupData.relatedtags),
            newGroupData.color,
            newGroupData.priority,
                groupName],
            (err) => {
                resolve(new sysController.createResponse(
                    's',
                    `Updated tag group "${groupName}"`,
                    {},
                    err,
                    `Error while updating tag group "${groupName}"`
                ))
            })
    })
}