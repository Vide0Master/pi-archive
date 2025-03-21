const SysController = require('../systemController')

module.exports = (request) => {
    return new Promise(async resolve => {
        switch (request.type) {
            case 'getAllGroups': {
                resolve(await SysController.dbinteract.getTagGroups())
            }; break;
            case 'createGroup': {
                resolve(await SysController.dbinteract.createTagGroup(request.groupName))
            }; break;
            case 'updateGroup': {
                const groupRslt = await SysController.dbinteract.getTagGroup(request.groupID)
                if (!groupRslt.group) {
                    resolve(new SysController.createResponse('e', 'No such group'))
                    return
                }

                const replacementData = new groupData(groupRslt.group, request.newGroupData)

                const updateResult = await SysController.dbinteract.updateTagGroup(request.groupID, replacementData)

                resolve(updateResult)
            }; break;
            case 'removeGroup': {
                resolve(await SysController.dbinteract.deleteTagGroup(request.groupName))
            }; break;
        }
    })
}

class groupData {
    constructor(oldData, newData) {
        for (const key in oldData) {
            this[key] = oldData[key]
        }
        for (const key in newData) {
            this[key] = newData[key]
        }
    }
}