const path = require('path')
const syscontroller = require('../systemController.js')
const fs = require('fs')

module.exports = (request, user) => {
    return new Promise(async resolve => {
        const langFilesPath = path.join(__dirname, '../../lang')
        const langFiles = fs.readdirSync(langFilesPath)
        const langsData = []
        for (const lang of langFiles) {
            const langFileData = require(path.join(langFilesPath, lang))
            langsData.push({
                name: langFileData.name,
                id: langFileData.id
            })
        }
        resolve(new syscontroller.createResponse(
            's',
            'Got languages data',
            { langs: langsData },
        ))
    })
}