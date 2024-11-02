const tgBotController = require('../tgBotController');
const sysController = require('../../core/systemController')

module.exports = async (bot, chatId, userdata, msgID, followupData, ...args) => {
    const addTags = args[0].split(' ')

    const postData = await tgBotController.API('getPostData', chatId, { id: followupData.postID })
    if (postData.rslt == 'e') {
        tgBotController.sendMessage(chatId, 'Error: ' + postData.msg)
        return
    }
    console.log(postData)
    const new_tags = postData.post.tags.concat(addTags)

    const tagRslt = await tgBotController.API('updateTags', chatId, { post: followupData.postID, newTags: new_tags })

    if (tagRslt.rslt == 'e') {
        tgBotController.sendMessage(chatId, 'Error: ' + tagRslt.msg)
        return
    }
    for (const i in new_tags) {
        new_tags[i] = '#' + new_tags[i]
    }
    tgBotController.sendMessage(chatId, `Tags added to post ${followupData.postID}!\n\nFull list: ${new_tags.join(' ')}`)
    delete tgBotController.followups[chatId]
};