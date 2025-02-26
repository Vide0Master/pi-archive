const sysController = require('../systemController')
const fs = require('fs')
const path = require('path')

function audLog(txt) {
    sysController.log(txt, [{ txt: 'AUDIT', txtc: 'red', txtb: 'white' }])
}

module.exports = (db) => {
    return new Promise(async resolve => {
        const dbAudit = await new Promise(resolve => {
            db.all(`SELECT * FROM posts`, (err, rows) => {
                resolve(new sysController.createResponse(
                    's',
                    `Got posts from DB for audit`,
                    { posts: rows },
                    err,
                    `Successfully got posts from DB for audit`
                ))
            })
        })

        audLog(`${dbAudit.rslt}/${dbAudit.msg}`)
        if (dbAudit.rslt == 'e') {
            return
        }

        const fileAudit = await new Promise(resolve => {
            fs.readdir(path.join(__dirname, `../../storage/file_storage`), (err, files) => {
                resolve(new sysController.createResponse(
                    's',
                    `Got posts file list for audit`,
                    { files: files },
                    err,
                    `Error while getting posts file list for audit`
                ))
            })
        })

        audLog(`${fileAudit.rslt}/${fileAudit.msg}`)
        if (fileAudit.rslt == 'e') {
            return
        }

        const audit_list = { dbAud: [], postFiles: []}

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

                if (sysController.config.static.AUDITCONTROL == 'MOVE') {
                    await new Promise(resolve => {
                        fs.rename(
                            path.join(__dirname, `../../storage/file_storage`, line.filename),
                            path.join(__dirname, `../../storage/UNLINKED`, line.filename),
                            (err) => {
                                if (err) {
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
                `Created DB audit file`,
                {},
                err,
                `Error creating DB audit file:`
            )
            audLog(`${audit_data.rslt}/${audit_data.msg}`)
        }
    )
}