const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./storage/data.db');
const responseConstructor = require('../responseConstructor.js');
const consoleLogger = require(`../consoleLogger.js`)

// Очередь для хранения запросов и флаг для отслеживания выполнения
const queryQueue = [];
let isProcessing = false;

const DBProcessor = async (action, ...args) => {
    try {
        const request = require(`./${action}.js`);
        const requestResult = await request(db, ...args);
        return requestResult;
    } catch (err) {
        console.log(err);
        const ERRdata = new responseConstructor(
            'e',
            '',
            {},
            err.code,
            `Ошибка выполнения запроса БД [${action}]`
        );
        consoleLogger(`${ERRdata.rslt}/${ERRdata.msg}`);
        return ERRdata;
    }
};

const processQueue = async () => {
    if (isProcessing) return; // Если уже выполняется, ничего не делаем

    isProcessing = true;

    while (queryQueue.length > 0) {
        const { action, args, resolve } = queryQueue.shift();
        try {
            const result = await DBProcessor(action, ...args);
            resolve(result);
        } catch (err) {
            resolve(err);
        }
    }

    isProcessing = false;
};

const queueRequest = (action, ...args) => {
    return new Promise((resolve) => {
        queryQueue.push({ action, args, resolve });
        processQueue(); // Запускает обработку очереди
    });
};

module.exports = new Proxy({}, {
    get: (target, prop) => {
        return (...args) => {
            return queueRequest(prop, ...args);
        };
    }
});
