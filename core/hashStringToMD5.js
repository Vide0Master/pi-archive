const crypto = require('crypto');

module.exports = (string) => {
    return crypto.createHash('sha256').update(string).digest('hex');
}