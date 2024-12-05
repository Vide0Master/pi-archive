const fs = require('fs');
const path = require('path');
const dbinteract = require('../core/DB/DBController.js');

module.exports = class tgBotController {
    static bot;
    static sysController;
    static followups = {};

    static userConstr = class {
        constructor(chatId) {
            this.type = 'TGBOT',
                this.key = chatId
        }
    }

    static inlineConstr = class {
        constructor(buttons) {
            this.inline_keyboard = [];

            let row = [];
            buttons.forEach((button, index) => {
                row.push({ text: button.text, callback_data: button.data });

                if (row.length === 3 || index === buttons.length - 1) {
                    this.inline_keyboard.push(row);
                    row = [];
                }
            });
        }
    }

    static getUserLang(userData) {
        let userLang = "ENG"
        try {
            userLang = userData.usersettings.lang || "ENG"
        } catch { }
        return require(`../lang/${userLang}.json`).lang.TGBOT
    }

    static async API(action, chatID, request) {
        return await this.sysController.APIprocessorTG(action, new this.userConstr(chatID), request);
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

    static async executeCommand(command, chatId, msgID, userdata, ...args) {
        const commandPath = path.join(__dirname, 'commands', `${command}.js`);
        if (!fs.existsSync(commandPath)) {
            await this.sendMessage(chatId, 'No file for command ' + command, msgID)
            return
        }
        const commandFn = require(commandPath);
        return await commandFn(this.bot, chatId, msgID, userdata, ...args);
    }

    static async executeFollowup(name, chatId, msgID, userdata, followupData, ...args) {
        const commandPath = path.join(__dirname, 'followups', `${name}.js`);
        if (!fs.existsSync(commandPath)) {
            await this.sendMessage(chatId, 'No file for followup ' + name, msgID)
            return
        }
        const commandFn = require(commandPath);
        await commandFn(this.bot, chatId, msgID, userdata, followupData, ...args);
    }

    static async registerButtonHandler() {
        this.bot.on('callback_query', async ({ id, data, message }) => {
            try {
                const userData = await tgBotController.getUserByTGID(message.chat.id)

                if (!userData.user) {
                    tgBotController.sendMessage(message.chat.id, `You need to /login first`, message.message_id)
                    this.bot.answerCallbackQuery(id);
                    return
                }

                const [action, ...args] = data.split(':');
                await this.executeCommand(action, message.chat.id, message.message_id, userData.user, ...args);
            } catch (err) {
                this.sendMessage(message.chat.id, 'Error processing callback: ' + err)
            }
            await this.bot.answerCallbackQuery(id);
        });
    }

    static async sendMessage(chatId, text, replyto, options = {}) {
        return await this.useUtil('sendMessage', chatId, text, replyto, options);
    }

    static async deleteMessage(chatId, messageId) {
        return await this.useUtil('deleteMessage', chatId, messageId);
    }
}