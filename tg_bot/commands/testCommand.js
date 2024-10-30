
const tgBotController = require('../tgBotController');
const sysController = tgBotController.sysController
module.exports = async (bot, chatId, msgId, userdata, ...args) => {

    const buttons = []

    for (i = 1; i <= args[0]; i++) {
        const btnRow = []
        buttons.push(btnRow)
        for (j = 1; j <= args[1]; j++) {
            btnRow.push({ text: `FUCK[${i}:${j}]`, data: `1` })
        }
    }

    tgBotController.sendMessage(chatId, 'sex?', null, buttons)
};
