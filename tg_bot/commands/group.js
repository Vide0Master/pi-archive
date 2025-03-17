const tgBotController = require('../tgBotController');
const sysController = require('../../core/systemController')

module.exports = async (bot, chatId, msgId, userdata, ...args) => {
    const lpack = tgBotController.getUserLang(userdata)
    const groupIdArg = args[0];
    const isDoc = args[1] === 'file';

    const gruopRslt = await sysController.dbinteract.getPostGroupByID(groupIdArg)

    for (const postID of gruopRslt.group.group) {
        await require('./post')(bot, chatId, msgId, userdata, postID, isDoc)
    }
};
