const fs = require('fs');
const path = require('path');
const dbinteract = require('../core/DB/DBController.js');

module.exports = class tgBotController {
    static bot;
    static sysController;
    static followups = {};

    static async API(action, user, request) {
        return this.sysController.APIprocessorTG(action, user, request);
    }

    static async getUserByTGID(tgid) {
        const userData = await dbinteract.getUserBySessionData('TGBOT', tgid)
        return userData
    }

    static async initialize(botInstance) {
        this.bot = botInstance;
        await this.registerButtonHandler();
    }

    static async useUtil(utilN, ...args) {
        const utilPath = path.join(__dirname, 'utils', `${utilN}.js`);
        if (!fs.existsSync(utilPath)) {
            await this.sendMessage(args[0], 'No such util: ' + utilN);
        }
        const util = require(utilPath);
        return await util(this.bot, ...args);
    }

    static async executeCommand(command, chatId, userdata, msgID, ...args) {
        const commandPath = path.join(__dirname, 'commands', `${command}.js`);
        if (!fs.existsSync(commandPath)) {
            await this.sendMessage(chatId, 'No file for command ' + command, msgID)
            return
        }
        const commandFn = require(commandPath);
        await commandFn(this.bot, chatId, userdata, ...args);
    }

    static async executeFollowup(name, chatId, userdata, msgID, followupData, ...args) {
        const commandPath = path.join(__dirname, 'followups', `${name}.js`);
        if (!fs.existsSync(commandPath)) {
            await this.sendMessage(chatId, 'No file for followup ' + name, msgID)
            return
        }
        const commandFn = require(commandPath);
        await commandFn(this.bot, chatId, userdata, msgID, followupData, ...args);
    }

    static async sendMessage(chatId, text, replyto, options = {}) {
        return await this.useUtil('sendMessage', chatId, text, replyto, options);
    }

    static async registerButtonHandler() {
        this.bot.on('callback_query', async ({ id, data, message }) => {
            try {
                const userData = await tgBotController.getUserByTGID(message.chat.id)

                const [action, ...args] = data.split(':');
                await this.executeCommand(action, message.chat.id, userData.user, message.message_id, ...args);
            } catch (err) {
                this.sendMessage(message.chat.id, 'Error processing callback: ' + err)
            }
            await this.bot.answerCallbackQuery(id);
        });
    }
}