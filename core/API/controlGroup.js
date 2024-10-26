const sysController = require('../systemController')

//экспорт функции
module.exports = (request, userData) => {
    return new Promise(async resolve => {
        switch (request.type) {

            //region g my grps
            case 'getMyGroups': {
                const user_post_groups = await sysController.dbinteract.getUserPostGroups(userData.login)
                for (const group of user_post_groups.groups) {
                    group.group = JSON.parse(group.group)
                }
                resolve(user_post_groups)
            }; break;

            //region g grp b id
            case 'getGroupByID': {
                const group = await sysController.dbinteract.getPostGroupByID(request.id)
                resolve(group)
            }; break;

            //region cr grp
            case 'createGroup': {
                const postlist = request.posts.map(item => String(item))
                const create_group_result = await sysController.dbinteract.createPostGroup(
                    request.name,
                    postlist,
                    userData.login
                )
                resolve(create_group_result)
            }; break;

            //region add post
            case 'addPost': {
                const currentPostListRslt = await sysController.dbinteract.getPostGroupByID(request.id)
                if (currentPostListRslt.rslt == 'e') {
                    resolve(currentPostListRslt)
                    return
                }

                const postString = String(request.post)

                const allGroups = await sysController.dbinteract.getAllGroups()
                for (const grp of allGroups.groups) {
                    if (grp.group.includes(postString) && grp.id != request.id) {
                        resolve(new sysController.createResponse(
                            'w',
                            `Post cannot be assigned to 2 different groups. Post is already issigned to group ID${grp.id}`
                        ))
                    }
                }

                const groupList = currentPostListRslt.group.group
                groupList.push(postString)

                const update_result = await sysController.dbinteract.updatePostGroup(request.id, groupList)
                resolve(update_result)
            }; break;

            //region rm post
            case 'removePost': {
                const currentPostListRslt = await sysController.dbinteract.getPostGroupByID(request.groupId)
                if (currentPostListRslt.rslt == 'e') {
                    resolve(currentPostListRslt)
                    sysController.log(currentPostListRslt.rslt + '/' + currentPostListRslt.msg)
                    return
                }

                const groupList = currentPostListRslt.group.group.filter(item => item != request.postId)
                const update_result = await sysController.dbinteract.updatePostGroup(request.groupId, groupList)
                resolve(update_result)
            }; break;

            //region reord grp
            case 'reorderGroup': {
                const new_group = request.newOrder.map(val => String(val))

                const update_result = await sysController.dbinteract.updatePostGroup(request.groupID, new_group)
                resolve(update_result)
            }; break;

            //region rnm grp
            case 'renameGroup': {
                console.log(request)
                const rename_result = await sysController.dbinteract.updateGroupName(request.groupID, request.newName)
                resolve(rename_result)
            }; break;

            //region del grp
            case 'deleteGroup': {
                const deleteResult = await sysController.dbinteract.deleteGroup(request.groupID)
                resolve(deleteResult)
            }; break;

            case 'setGroupType': {
                const setGroupTypeResult = await sysController.dbinteract.setGroupType(request.groupID, request.newGroupType)
                resolve(setGroupTypeResult)
            }; break;
        }
    })
}