//импорт
const sysController = require('../systemController.js')
const fs = require('fs')
const path = require('path')

//экспорт функции
module.exports = (request, user_data) => {
    return new Promise(async resolve => {
        let postData = await sysController.dbinteract.getPostData(request.post)

        if (postData.rslt == 'e') {
            resolve(postData)
            return
        }

        postData = postData.post

        const isOwner = postData.author == user_data.login
        const isAdmin = sysController.config.static.user_status[user_data.status] > 1

        if (!isOwner && !isAdmin) {
            resolve(new sysController.createResponse(
                'e',
                'Access rejected'
            ))
            return
        }

        const ext = path.extname(postData.file).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) {
            fs.unlink(`./storage/file_storage/${postData.file}`, async (err) => {
                if (err) {
                    sysController.log(`e/Erorr deleting file [deletePost|image]: ${err}`)
                    resolve({ rslt: 'e', msg: `e/Erorr deleting file [deletePost|image]: ${err}` })
                    return
                } else {
                    const result = await sysController.dbinteract.deletePost(request.post)
                    resolve(result)
                }
            })
        } else if (['.mp4', '.mov', '.avi', '.mkv'].includes(ext)) {
            fs.unlink(`./storage/file_storage/${postData.file}`, async (err) => {
                if (err) {
                    sysController.log(`e/Erorr deleting file [deletePost|video]: ${err}`)
                    resolve({ rslt: 'e', msg: `e/Erorr deleting file [deletePost|video]: ${err}` })
                    return
                } else {
                    fs.unlink(`./storage/video_thumbnails/THUMBFOR-${path.parse(postData.file).name}.jpg`, async (err) => {
                        if (err) {
                            sysController.log(`e/Erorr deleting file [deletePost|video|thumbnail]: ${err}`)
                            resolve({ rslt: 'e', msg: `e/Erorr deleting file [deletePost|video|thumbnail]: ${err}` })
                        } else {
                            const result = await sysController.dbinteract.deletePost(request.post)
                            resolve(result)
                        }
                    })
                }
            })
        }
    })
}