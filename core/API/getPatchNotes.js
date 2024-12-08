const syscontroller = require('../systemController.js')

module.exports = (request) => {
    return new Promise(async resolve => {
        resolve(require('../../patchNotes.json'))
    })
}