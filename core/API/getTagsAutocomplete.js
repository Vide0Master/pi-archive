const sysController = require('../systemController.js')

const systemTags = [
    "author:",
    "id:"
]

module.exports = (request, user_data) => {
    return new Promise(async resolve => {
        const tags = await sysController.dbinteract.getTagsAutocomplete(request.tagPart, user_data.blacklist, 10)
        if (tags.rslt == 'e') {
            resolve(tags)
            return
        }
        const tagGroupsRslt = await sysController.dbinteract.getTagGroups()
        if (tagGroupsRslt.rslt == 'e') {
            resolve(tags)
            return
        }
        const autocompTags = tags.tagList
        const tagGroups = tagGroupsRslt.groups

        const resultTags = []

        for (const tag of autocompTags) {
            const currentTagGroup = tagGroups.find(grp => grp.relatedtags.includes(tag.tag))
            if (currentTagGroup) {
                resultTags.push({
                    tag: tag.tag,
                    count: tag.count,
                    group: {
                        name: currentTagGroup.groupname,
                        color: currentTagGroup.color,
                        priority: currentTagGroup.priority
                    }
                })
            } else {
                resultTags.push({
                    tag: tag.tag,
                    count: tag.count,
                })
            }
        }

        const regex = new RegExp(request.tagPart.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        const foundSysTags = systemTags.filter(tag => regex.test(tag));

        for (const tag of foundSysTags) {
            resultTags.push({
                tag: tag,
                group: {
                    color: "#ffffff"
                }
            })
        }

        resolve(new sysController.createResponse(
            's',
            'Got autocomplete tags list',
            { tags: resultTags }
        ))
    })
}