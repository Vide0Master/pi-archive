const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./storage/data.db');
const responseConstructor = require('../responseConstructor.js');
const consoleLogger = require(`../consoleLogger.js`)

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
            `Error executing ${action} DB request`
        );
        consoleLogger(`${ERRdata.rslt}/${ERRdata.msg}`, [{ txt: 'DB', txtc: 'red', txtb: 'white' }]);
        return ERRdata;
    }
};

const processQueue = async () => {
    if (isProcessing) return;

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
        processQueue();
    });
};

module.exports = new Proxy({}, {
    get: (target, prop) => {
        return (...args) => {
            return queueRequest(prop, ...args);
        };
    }
});
