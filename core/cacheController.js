class cacheController {
    static cache = {}

    static createRecord(id, data, timer) {
        this.cache[id] = {
            data,
            timer,
            timeout: setTimeout(() => {
                delete this.cache[id]
            }, timer * 1000 * 60 * 60)
        }
    }

    static removeRecord(id) {
        delete this.cache[id]
    }

    static prolongRecord(id) {
        clearTimeout(this.cache[id].timeout)
        this.cache[id].timeout = setTimeout(() => {
            delete this.cache[id]
        }, this.cache[id].timer * 1000 * 60 * 60)
    }

    static getRecordData(id) {
        this.prolongRecord(id)
        return this.cache[id].data
    }

    static checkAvailabilty(id) {
        return !!this.cache[id]
    }
}

module.exports = cacheController