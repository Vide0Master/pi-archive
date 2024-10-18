const sysController = require('../systemController')
const fs = require('fs')
const path = require('path')

module.exports = (db) => {
    return new Promise(async resolve => {
        const dbAudit = await new Promise(resolve => {
            db.all(`SELECT * FROM posts`, (err, rows) => {
                resolve(new sysController.createResponse(
                    's',
                    `Successfully got posts from DB for audit`,
                    { posts: rows },
                    err,
                    `Successfully got posts from DB for audit`
                ))
            })
        })

        sysController.log(`${dbAudit.rslt}/${dbAudit.msg}`)
        if(dbAudit.rslt=='e'){
            return
        }

        const fileAudit = await new Promise(resolve => {
            fs.readdir(path.join(__dirname, `../../storage/file_storage`), (err, files) => {
                resolve(new sysController.createResponse(
                    's',
                    `Successfully got posts file list for audit`,
                    { files: files },
                    err,
                    `Error while getting posts file list for audit`
                ))
            })
        })

        sysController.log(`${fileAudit.rslt}/${fileAudit.msg}`)
        if(fileAudit.rslt=='e'){
            return
        }

        const thumbAudit = await new Promise(resolve => {
            fs.readdir(path.join(__dirname, `../../storage/video_thumbnails`), (err, files) => {
                resolve(new sysController.createResponse(
                    's',
                    `Successfully got video thumbnails file list for audit`,
                    { files: files },
                    err,
                    `Error while getting video thumbnails file list for audit`
                ))
            })
        })

        sysController.log(`${thumbAudit.rslt}/${thumbAudit.msg}`)
        if(thumbAudit.rslt=='e'){
            return
        }

        const audit_list = { dbAud: [], postFiles: [], thumbs: [] }

        for (const postData of dbAudit.posts) {
            const audit_data = {
                id: postData.id,
                file: {
                    name: postData.file,
                    isPresent: fs.existsSync(path.join(__dirname, `../../storage/file_storage`, postData.file))
                }
            }

            const post_file_ext = path.extname(postData.file).toLowerCase()
            switch (true) {
                case ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(post_file_ext): {
                    audit_data.file.type = 'IMAGE'
                }; break;
                case ['.mp4', '.mov', '.avi', '.mkv'].includes(post_file_ext): {
                    audit_data.file.type = 'VIDEO'
                    const thumbname = `THUMBFOR-${path.parse(audit_data.file.name).name}.jpg`
                    if (thumbAudit.files.find(line => line == thumbname)) {
                        audit_data.thumb = thumbname
                    } else {
                        audit_data.thumb = '!MISSING!'
                    }
                }; break;
                default: {
                    audit_data.file.type = post_file_ext
                }; break
            }

            audit_list.dbAud.push(audit_data)
        }

        for (const filename of fileAudit.files) {
            if (!dbAudit.posts.find(line => line.file == filename)) {
                audit_list.postFiles.push({
                    unlinked: true,
                    filename: filename
                })
            }
        }

        for (const filename of thumbAudit.files) {
            if (!dbAudit.posts.find(line => `THUMBFOR-${path.parse(line.file).name}.jpg` == filename)) {
                audit_list.thumbs.push({
                    unlinked: true,
                    filename: filename
                })
            }
        }

        WriteAuditFile(audit_list)
        resolve()
    })
}

async function WriteAuditFile(data) {
    let auditText = '\n'

    auditText += ']DB AUDIT[\n\n'
    for (const line of data.dbAud) {
        let auditTextLine = ''
        if (line.id) {
            auditTextLine += `-----=====[POST ${line.id}]=====-----\n`
            auditTextLine += `DB POST FILE NAME: [${line.file.name}]\n`
            auditTextLine += line.file.isPresent ? 'FS POST IS PRESENT\n' : 'FS POST IS !MISSING!\n'
            auditTextLine += `FILETYPE: ${line.file.type}\n`
            if (line.file.type == 'VIDEO') {
                auditTextLine += `VIDEO THUMBNAIL: ${line.thumb}\n`
            }
            auditTextLine += `=====-----=====-----=====-----=====\n\n`
        }
        auditText += auditTextLine
    }

    if (data.postFiles.length > 0) {
        auditText += ']POST FILE AUDIT[\n\n'
        for (const line of data.postFiles) {
            let auditTextLine = ''
            if (line.unlinked) {
                auditTextLine += `FILE [${line.filename}] IS UNRELATED TO ANY POST\n\n`

                if(sysController.config.static.AUDITCONTROL=='MOVE'){
                    await new Promise(resolve => {
                        fs.rename(
                            path.join(__dirname, `../../storage/file_storage`, line.filename),
                            path.join(__dirname, `../../storage/UNLINKED`, line.filename),
                            (err)=>{
                                if(err){
                                    sysController.log(`e/Error moving file [${line.filename}] [AUDIT]`)
                                }
                                resolve()
                            }
                        )
                    })
                }
            }
            auditText += auditTextLine
        }
    }

    if (data.thumbs.length > 0) {
        auditText += ']THUMB FILE AUDIT[\n\n'
        for (const line of data.thumbs) {
            let auditTextLine = ''

            if (line.unlinked) {
                auditTextLine += `THUMB [${line.filename}] IS UNRELATED TO ANY VIDEO`
                
                if(sysController.config.static.AUDITCONTROL=='MOVE'){
                    await new Promise(resolve => {
                        fs.rename(
                            path.join(__dirname, `../../storage/file_storage`, line.filename),
                            path.join(__dirname, `../../storage/UNLINKED`, line.filename),
                            (err)=>{
                                if(err){
                                    sysController.log(`e/Error moving file [${line.filename}] [AUDIT]`)
                                }
                                resolve()
                            }
                        )
                    })
                }
            }
            auditText += auditTextLine
        }
    }

    let auditFinalText = ''
    auditFinalText += '--==]SUMMARY[==--\n'
    auditFinalText += `CHECKED ${data.dbAud.length} POSTS\n`
    auditFinalText += `${data.postFiles.length} FILES UNRELATED TO ANY POST\n`
    auditFinalText += `${data.thumbs.length} THUMBS UNRELATED TO ANY VIDEO\n`
    auditFinalText += `AUDIT ACTION METHOD [${sysController.config.static.AUDITCONTROL}]\n`
    auditFinalText += auditText

    fs.writeFile(
        path.join(__dirname, `../../storage/STORAGE-DATA.AUDIT`),
        auditFinalText,
        err => {
            if (err) {
                console.log(err)
            }
            const audit_data = new sysController.createResponse(
                's',
                `Successfully created DB audit file`,
                {},
                err,
                `Error creating DB audit file:`
            )
            sysController.log(`${audit_data.rslt}/${audit_data.msg}`)
        }
    )
}