const uploadButton = createButton('Загрузить')
uploadButton.style.display = 'none'

let gftu = []

function createUploadBlock(container) {
    const input_wrapper = createDiv('file-input-wrapper')
    container.appendChild(input_wrapper);

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.className = 'file-input'
    fileInput.id = 'file-input'
    input_wrapper.appendChild(fileInput)

    const label_for_input = document.createElement('label')
    label_for_input.setAttribute('for', 'file-input')
    label_for_input.className = 'file-label'
    label_for_input.innerText = 'Выбрать файлы'
    input_wrapper.appendChild(label_for_input)

    const fileList = createDiv('file-list')
    fileList.style.display = 'none'

    // Вставка элементов в контейнер

    container.appendChild(fileList);
    container.appendChild(uploadButton);

    let filesToUpload = [];

    fileInput.addEventListener('change', () => {
        filesToUpload = []
        fileList.innerHTML = '';
        fileList.style.display = 'none'
        const filesToUploadLocal = Array.from(fileInput.files);
        uploadButton.style.display = 'none'

        console.log(fileInput.files)

        filesToUploadLocal.forEach((file, index) => {
            const fileBlock = document.createElement('div');
            fileBlock.className = 'file-block'
            fileBlock.dataset.index = index;

            const reader = new FileReader();

            reader.onload = (e) => {
                const prev_cont = createDiv('preview-container')
                let previewElement;

                if (file.type.startsWith('video/')) {
                    previewElement = document.createElement('video');
                    previewElement.src = e.target.result;
                    previewElement.controls = false;
                    previewElement.autoplay = true;
                    previewElement.loop = true;
                    previewElement.volume = 0
                } else {
                    previewElement = document.createElement('img');
                    previewElement.src = e.target.result;
                    previewElement.alt = 'file preview';
                }
                previewElement.className = 'preview-elem'
                prev_cont.appendChild(previewElement)

                // Добавление элементов в блок файла
                fileList.appendChild(fileBlock)
                fileBlock.appendChild(prev_cont)


                const data_container = createDiv('data-container')
                fileBlock.appendChild(data_container)

                const data_input_container = createDiv('data-input')
                data_container.appendChild(data_input_container)


                const fname = createDiv('file-name')
                data_input_container.appendChild(fname)
                fname.innerText = file.name
                fname.title = 'Оригинальное имя файла сохранено не будет'

                const tags = document.createElement('textarea')
                data_input_container.appendChild(tags)
                tags.placeholder = 'Теги'

                const desc = document.createElement('textarea')
                data_input_container.appendChild(desc)
                desc.placeholder = 'Описание'


                const data_progress = createDiv('data-progress')
                data_container.appendChild(data_progress)
                data_progress.style.display = 'none'

                const upload_container = createDiv('line-container')
                data_progress.appendChild(upload_container)
                const upload_text = createDiv()
                upload_container.appendChild(upload_text)
                upload_text.innerText = 'Файл'

                updateStatusClass(upload_container, 'waiting')
                upload_text.innerText = 'Ожидание ...'


                const tags_container = createDiv('line-container')
                data_progress.appendChild(tags_container)
                const tags_text = createDiv()
                tags_container.appendChild(tags_text)
                tags_text.innerText = 'Теги'

                updateStatusClass(upload_container, 'no-data')
                tags_text.innerText = 'Не указаны теги. Этап пропущен.'


                const desc_container = createDiv('line-container')
                data_progress.appendChild(desc_container)
                const desc_text = createDiv()
                desc_container.appendChild(desc_text)
                desc_text.innerText = 'Описание'

                updateStatusClass(upload_container, 'no-data')
                desc_text.innerText = 'Нет описания. Этап пропущен.'


                function updateStatusClass(element, newClass) {
                    const validClasses = ['no-data', 'waiting', 'progress', 'success', 'error'];

                    element.classList.remove(...validClasses);

                    if (validClasses.includes(newClass)) {
                        element.classList.add(newClass);
                    }
                }

                tags.addEventListener('change', () => {
                    if (tags.value == '') {
                        updateStatusClass(tags_container, 'no-data')
                        tags_text.innerText = 'Не указаны теги. Этап пропущен.'
                    } else {
                        updateStatusClass(tags_container, 'waiting')
                        tags_text.innerText = 'Ожидание ...'
                    }
                })


                desc.addEventListener('change', () => {
                    if (desc.value == '') {
                        updateStatusClass(desc_container, 'no-data')
                        desc_text.innerText = 'Нет описания. Этап пропущен.'
                    } else {
                        updateStatusClass(desc_container, 'waiting')
                        desc_text.innerText = 'Ожидание ...'
                    }
                })

                function updateFileProgress(perc) {
                    upload_text.innerText = `Загрузка файла: ${perc}`
                }

                async function upload() {
                    data_progress.removeAttribute('style')
                    data_input_container.style.display = 'none'


                    updateStatusClass(upload_container, 'progress')
                    const upload = await handleFileUpload(file, updateFileProgress);

                    if (upload.rslt == 'e') {
                        updateStatusClass(upload_container, 'error')
                        alert(`${upload.rslt}/${upload.msg}`)
                        upload_text.innerHTML += '<br>Ошибка!'
                        return
                    } else {
                        updateStatusClass(upload_container, 'success')
                        upload_text.innerHTML += '<br>Завершено!'
                    }

                    const postData = await request('getPostData', { id: upload.postID })
                    console.log(postData)
                    if (postData.rslt == 'e') {
                        alert(`${postData.rslt}/${postData.msg}`)

                        updateStatusClass(tags_container, 'error')
                        tags_text.innerText = 'Ошибка получения данных поста для обработки тегов!'

                        updateStatusClass(desc_container, 'error')
                        tags_text.innerText = 'Ошибка получения данных поста для обработки описания!'

                        return
                    }

                    if (tags.value != '') {
                        updateStatusClass(tags_container, 'progress')
                        tags_text.innerText = 'Обработка тегов ...'
                        const new_tags = postData.post.tags.concat(tags.value.split(/\s+|\n+/).filter(val => val !== ''))
                        const tagupd = await request('updateTags', { post: postData.post.id, newTags: new_tags });

                        if (tagupd.rslt == 'e') {
                            alert(`${tagupd.rslt}/${tagupd.msg}`)
                            updateStatusClass(tags_container, 'error')
                            tags_text.innerText = 'Ошибка установки тегов!'
                        } else {
                            updateStatusClass(tags_container, 'success')
                            tags_text.innerText = 'Теги обработаны.'
                        }
                    }

                    if (desc.value != '') {
                        updateStatusClass(desc_container, 'progress')
                        desc_text.innerText = 'Обработка описания ...'
                        const descupd = await request('updatePostDesc', { postID: postData.post.id, newDesc: desc.value })

                        if (descupd.rslt == 'e') {
                            alert(`${descupd.rslt}/${descupd.msg}`)
                            updateStatusClass(desc_container, 'error')
                            tags_text.innerText = 'Ошибка установки описания!'
                        } else {
                            updateStatusClass(desc_container, 'success')
                            desc_text.innerText = 'Описание обработано.'
                        }
                    }
                }

                if (index == 0) {
                    fileList.removeAttribute('style')
                    uploadButton.removeAttribute('style')
                    uploadButton.value = 'Загрузить'
                }
                if (index > 0) {
                    uploadButton.value = 'Загрузить всё'
                }

                filesToUpload.push(upload)
            };
            reader.readAsDataURL(file);
        });
        gftu = filesToUpload
        console.log(filesToUpload)
    });
}

async function uploadProcessor() {
    if (gftu.length === 0) {
        console.warn('Нет файлов для загрузки.');
        return;
    }

    // Показать сообщение о начале загрузки
    uploadButton.textContent = 'Загрузка...';

    try {
        for (const file of gftu) {
            await file()
        }
        uploadButton.textContent = 'Загрузить'
    } catch (error) {
        alert('Ошибка загрузки: ' + error)
    }
}

uploadButton.addEventListener('click', uploadProcessor);

function handleFileUpload(file, progressCallback) {
    return new Promise((resolve) => {
        const formData = new FormData();
        formData.append('file', file);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/upload', true);

        const userKey = localStorage.getItem('userKey') || sessionStorage.getItem('userKey');
        xhr.setRequestHeader('user-key', userKey);

        // Отслеживание прогресса загрузки
        xhr.upload.onprogress = function (event) {
            if (event.lengthComputable) {
                const percentComplete = `${formatFileSize(event.loaded)} / ${formatFileSize(event.total)}`
                if (progressCallback) progressCallback(percentComplete);
            }
        };

        // Обработка завершения загрузки
        xhr.onload = function () {
            if (xhr.status === 200) {
                resolve(JSON.parse(xhr.responseText));
            } else {
                resolve({ rslt: 'e', msg: 'Ошибка загрузки' })
            }
        };

        // Обработка ошибок
        xhr.onerror = function () {
            resolve({ rslt: 'e', msg: 'Ошибка запроса' })
        };

        xhr.send(formData);
    });
}

// Вызов функции createUploadBlock
createUploadBlock(document.querySelector('.load-container'));
