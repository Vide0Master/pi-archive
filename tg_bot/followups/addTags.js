const tgBotController = require('../tgBotController');
const sysController = require('../../core/systemController')

module.exports = async (bot, chatId, msgID, userdata, followupData, ...args) => {
    const lpack = tgBotController.getUserLang(userdata)
    const addTags = args[0].split(' ')

    const postData = await tgBotController.API('getPostData', chatId, { id: followupData.postID })
    if (postData.rslt == 'e') {
        tgBotController.sendMessage(chatId, 'Error: ' + postData.msg, msgID)
        return
    }
    const new_tags = postData.post.tags.concat(addTags)

    const tagRslt = await tgBotController.API('updateTags', chatId, { post: followupData.postID, newTags: new_tags })

    if (tagRslt.rslt == 'e') {
        tgBotController.sendMessage(chatId, 'Error: ' + tagRslt.msg, msgID)
        return
    }
    for (const i in new_tags) {
        new_tags[i] = '#' + new_tags[i]
    }
    tgBotController.sendMessage(chatId, `${lpack.addTags.tagsAdded[0]} ${followupData.postID}!\n\n${lpack.addTags.tagsAdded[1]}: ${new_tags.join(' ')}`, msgID)
    delete tgBotController.followups[chatId]
};
