const SysController = require('../systemController')

//экспорт функции
module.exports = (request, userData) => {
    return new Promise(async resolve => {
        const tags = request.taglist
        const limit = request.tagcount
        const DBtags = await SysController.dbinteract.getTagList(limit)
        const userblacklist = userData.blacklist
        let tag_array = []
        if (tags) {
            for (const tag of DBtags) {
                if (tags.includes(tag.tag) && !userblacklist.includes(tag.tag)) {
                    tag_array.push(tag)
                }
            }
        } else {
            for (const tag of DBtags) {
                if (!userblacklist.includes(tag.tag)) {
                    tag_array.push(tag)
                }
            }
        }

        const tags_groups = await SysController.dbinteract.getTagGroups()

        for (let tagN in tag_array) {
            const currentTagGroup = tags_groups.groups.find(grp => grp.relatedtags.includes(tag_array[tagN].tag))
            if (currentTagGroup) {
                tag_array[tagN] = {
                    tag: tag_array[tagN].tag,
                    count: tag_array[tagN].count,
                    group: {
                        name: currentTagGroup.groupname,
                        color: currentTagGroup.color,
                        priority: currentTagGroup.priority
                    }
                }
            } else {
                tag_array[tagN] = {
                    tag: tag_array[tagN].tag,
                    count: tag_array[tagN].count,
                }
            }
        }

        resolve(tag_array)
    })
}