const sysController = require('../systemController')

module.exports = (db, groupID, newGroupData) => {
    return new Promise(async resolve => {
        db.run(`UPDATE tags_groups
            SET groupname = ?, relatedtags = ?, color = ?, priority = ?
            WHERE id = ?`,
            [JSON.stringify(newGroupData.groupname),
            JSON.stringify(newGroupData.relatedtags),
            newGroupData.color,
            newGroupData.priority,
                groupID],
            (err) => {
                resolve(new sysController.createResponse(
                    's',
                    `Updated tag group "${groupID}"`,
                    {},
                    err,
                    `Error while updating tag group "${groupID}"`
                ))
            })
    })
}