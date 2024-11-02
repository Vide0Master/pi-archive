// fileCache.js

const fileCache = {};

function cacheFile(key, data, ttl = 86400 * 1000) {
    fileCache[key] = {
        data,
        expires: Date.now() + ttl
    };
}

function getCachedFile(key) {
    const cached = fileCache[key];
    if (cached && cached.expires > Date.now()) {
        return cached.data;
    }
    delete fileCache[key];
    return null;
}

function cleanCache() {
    const now = Date.now();
    for (const key in fileCache) {
        if (fileCache[key].expires < now) {
            delete fileCache[key];
        }
    }
}

module.exports = {
    cacheFile,
    getCachedFile,
    cleanCache
};
