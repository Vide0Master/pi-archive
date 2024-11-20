const uploadLang = Language.upload

function getelem(selector) {
    return document.querySelector(selector)
}

getelem('.file-upload-label').innerHTML = uploadLang.DnD
getelem('#uploadAll').value = uploadLang.uploadAll
getelem('.checkbox-wrapper .label').innerHTML = uploadLang.asGroup
getelem('.checkbox-wrapper #as_group').title = uploadLang.asGroup
getelem('.checkbox-wrapper #groupName').placeholder = uploadLang.groupName

function handleFileUpload(file, progressCallback) {
    return new Promise((resolve) => {
        const formData = new FormData();
        formData.append('file', file);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/upload', true);

        const userKey = localStorage.getItem('userKey') || sessionStorage.getItem('userKey');
        xhr.setRequestHeader('user-key', userKey);

        xhr.upload.onprogress = function (event) {
            if (event.lengthComputable) {
                const percentComplete = `${formatFileSize(event.loaded)} / ${formatFileSize(event.total)}`
                if (progressCallback) progressCallback(percentComplete, event.loaded / event.total);
            }
        };

        xhr.onload = function () {
            if (xhr.status === 200) {
                resolve(JSON.parse(xhr.responseText));
            } else {
                resolve({ rslt: 'e', msg: uploadLang.uError })
            }
        };

        xhr.onerror = function () {
            resolve({ rslt: 'e', msg: 'Request error' })
        };

        xhr.send(formData);
    });
}

const fileListContainer = document.querySelector('.file-list')
const actionRow = document.querySelector('.action-row')
const asGroup = actionRow.querySelector('#as_group')
const groupField = actionRow.querySelector('#groupName')
groupField.style.display = 'none'
asGroup.addEventListener('change', (e) => {
    if (asGroup.checked) {
        groupField.removeAttribute('style')
    } else {
        groupField.style.display = 'none'
    }
})

function setPlaceholderVisibility(state) {
    const label = document.querySelector('label.file-upload-label')
    if (state) {
        label.removeAttribute('style')
    } else {
        label.style.display = 'none'
    }
}

let uploadList = []

const uploadBtn = actionRow.querySelector('#uploadAll')
uploadBtn.addEventListener('click', async () => {
    checkActionRow(false)
    const requests = []
    for (const prep of uploadList) {
        requests.push(prep())
    }
    console.log(requests)
    const IDs = await Promise.all(requests.map(fn => fn()))
    if (asGroup.checked) {
        let groupName = groupField.value
        if (groupName == '') groupName = 'Group'
        const group_create_result = await request('controlGroup', { type: 'createGroup', posts: IDs, name: groupName })
        if (group_create_result.rslt == 's') {
            alert(`s/${IDs.length} ${uploadLang.postsUpload.group} "${groupName}"`)
        }
    } else {
        alert(`s/${uploadLang.postsUpload.multiple}`)
    }
    console.log(IDs)
})

function updateStatusClass(element, newClass) {
    const validClasses = ['background', 'waiting', 'progress', 'success', 'error'];
    element.classList.remove(...validClasses);
    if (validClasses.includes(newClass)) {
        element.classList.add(newClass);
    }
}

function checkActionRow(state = true) {
    if (uploadList.length > 1 && state) {
        actionRow.style.display = 'flex'
    } else {
        actionRow.removeAttribute('style')
    }
}

document.querySelector('#file-upload').addEventListener('change', (e) => {
    uploadList = []
    const fileList = (Array.from(e.target.files)).sort((a, b) => a.name.localeCompare(b.name))

    fileListContainer.innerHTML = ""

    setPlaceholderVisibility(!fileList.length > 0)

    for (const file of fileList) {
        let preventUpload = false
        console.log(file)
        const inVideoLimit = file.size < 1024 * 1024 * 1024 * 5
        const inImageLimit = file.size < 1024 * 1024 * 50

        if (file.type.startsWith('video/')) {
            if (!inVideoLimit) {
                preventUpload = 'video'
            }
        } else if (file.type.startsWith('image/')) {
            if (!inImageLimit) {
                preventUpload = 'image'
            }
        } else {
            preventUpload = 'special'
        }

        const fileContainer = createDiv('file-container', fileListContainer)

        const filePreview = createDiv('file-preview-cont', fileContainer)

        let previewElement;
        if (file.type.startsWith('video/') || file.type.startsWith('image/')) {
            if (file.type.startsWith('video/')) {
                previewElement = document.createElement('video');
                previewElement.controls = false;
                previewElement.autoplay = true;
                previewElement.loop = true;
                previewElement.volume = 0
                previewElement.alt = 'video preview';
            } else if (file.type.startsWith('image/')) {
                previewElement = document.createElement('img');
                previewElement.alt = 'file preview';
            }
            previewElement.className = 'preview-elem'
            filePreview.appendChild(previewElement)
            const reader = new FileReader();
            reader.onload = e => previewElement.src = e.target.result
            reader.readAsDataURL(file)
        }

        const dataCol = createDiv('data-column', fileContainer)
        const filename = createDiv('filename', dataCol)
        filename.innerHTML = file.name

        const filesize = createDiv('filename', dataCol)
        filesize.innerHTML = `${uploadLang.fields.fSize}: ${formatFileSize(file.size)}`

        if (preventUpload) {
            const warning = createDiv('warning', dataCol)
            warning.innerHTML = uploadLang.tooBig
            if (preventUpload == 'video') {
                warning.innerHTML += " " + formatFileSize(1024 * 1024 * 1024 * 5)
            } else if (preventUpload == 'image') {
                warning.innerHTML += " " + formatFileSize(1024 * 1024 * 50)
            } else {
                warning.innerHTML = uploadLang.noSupport
            }
            return
        }

        const tags = document.createElement('textarea')
        dataCol.appendChild(tags)
        tags.placeholder = uploadLang.fields.tags

        const desc = document.createElement('textarea')
        dataCol.appendChild(desc)
        desc.placeholder = uploadLang.fields.desc

        function PREupload() {
            dataCol.innerHTML = ''

            const tagsList = tags.value.split(/\s+|\n+/).filter(val => val !== '');
            const descText = desc.value

            const uplContainer = createDiv('status-line', dataCol)
            const uplText = createDiv('status-text', uplContainer)
            uplText.innerHTML = uploadLang.queue
            updateStatusClass(createDiv('status-bar', uplContainer), 'background')
            const statusBar = createDiv('status-bar', uplContainer)
            updateStatusClass(statusBar, 'waiting')

            const tagsContainer = createDiv('status-line', dataCol)
            const tagsTextCont = createDiv('status-text', tagsContainer)
            tagsTextCont.innerHTML = uploadLang.queue
            const tagsBar = createDiv('status-bar', tagsContainer)
            updateStatusClass(tagsBar, 'waiting')

            const descContainer = createDiv('status-line', dataCol)
            const descTextCont = createDiv('status-text', descContainer)
            descTextCont.innerHTML = uploadLang.queue
            const descBar = createDiv('status-bar', descContainer)
            updateStatusClass(descBar, 'waiting')

            if (!tagsList.length > 0) {
                tagsContainer.remove()
            }

            if (descText == '') {
                descContainer.remove()
            }

            function updateUploadProgressBar(text, coef) {
                statusBar.style.width = `${coef * 100}%`
                if (coef < 1) {
                    updateStatusClass(statusBar, 'progress')
                    uplText.innerHTML = `${uploadLang.upload[0]} ${text}`
                } else if (coef == 1) {
                    updateStatusClass(statusBar, 'success')
                    uplText.innerHTML = `${uploadLang.upload[1]} ${formatFileSize(file.size)}`
                }
            }

            async function load() {
                const upload = await handleFileUpload(file, updateUploadProgressBar);
                if (upload.rslt != 'e') {
                    const fileFuncIndex = uploadList.indexOf(upload)
                    if (fileFuncIndex != -1) {
                        uploadList.splice(fileFuncIndex, 1);
                    }
                }

                const postData = await request('getPostData', { id: upload.postID })
                if (postData.rslt != 'e') {
                    if (tagsList.length > 0) {
                        updateStatusClass(tagsBar, 'progress')
                        tagsTextCont.innerHTML = `${uploadLang.tags[0]} ...`
                        const new_tags = postData.post.tags.concat(tagsList)
                        const tagupd = await request('updateTags', { post: postData.post.id, newTags: new_tags });
                        if (tagupd.rslt == 's') {
                            tagsTextCont.innerHTML = `${uploadLang.tags[1]}!`
                            updateStatusClass(tagsBar, 'success')
                        } else {
                            tagsTextCont.innerHTML = `${uploadLang.tags[2]}!\n${tagupd.msg}`
                            updateStatusClass(tagsBar, 'error')
                        }
                    }

                    if (descText != '') {
                        descTextCont.innerHTML = `${uploadLang.desc[0]} ...`
                        const descupd = await request('updatePostDesc', { postID: postData.post.id, newDesc: descText })
                        if (descupd.rslt == 's') {
                            descTextCont.innerHTML = `${uploadLang.desc[1]}!`
                            updateStatusClass(descBar, 'success')
                        } else {
                            descTextCont.innerHTML = `${uploadLang.desc[2]}!\n${tagupd.msg}`
                            updateStatusClass(descBar, 'error')
                        }
                    }

                    const pdata = createDiv('status-line', dataCol)
                    pdata.innerHTML = `${uploadLang.postCreated} ID:${upload.postID}`
                } else if (postData.rslt == 'e') {
                    alert(`e/${uploadLang.errGettingPostData} ID:${upload.postID}`)
                }

                previewElement.addEventListener('click', () => {
                    window.open(`/view/?id=${upload.postID}`, '_blank').focus();
                })
                previewElement.title = uploadLang.openPost
                previewElement.style.cursor = 'pointer'

                return upload.postID
            }
            return load
        }

        uploadList.push(PREupload)

        const soloUpload = createButton(uploadLang.uploadFile, dataCol)
        soloUpload.addEventListener('click', () => {
            PREupload()()
            checkActionRow(false)
        })
    }
    checkActionRow()
})