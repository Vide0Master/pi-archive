let post_data;

(() => {
    const userKey = localStorage.getItem('userKey') || sessionStorage.getItem('userKey');

    //region get F link
    function get_file_link(id) {
        return `/file?userKey=${userKey}&id=${id}`;
    }

    //region fetch PD
    async function fetchPostData(id) {
        const pdata = await request('getPostData', { id });
        if (pdata.rslt != 's') {
            alert(`${pdata.rslt}/${pdata.msg}`)
        }
        post_data = pdata.post
        return pdata.post;
    }

    //region save file
    function save_file(url, filename) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    //region create img
    function createImageElement() {
        const file_block = document.querySelector('.view-container .file');
        const image = document.createElement('img');
        file_block.appendChild(image);
        return image;
    }

    //region create video
    function createVideoElement() {
        const file_block = document.querySelector('.view-container .file');
        const video_container = document.createElement('video');
        file_block.appendChild(video_container);
        video_container.setAttribute('controls', '');
        video_container.setAttribute('loop', '');
        const video = document.createElement('source');
        video_container.appendChild(video);

        const savedVolume = localStorage.getItem('videoVolume');
        video_container.volume = savedVolume !== null ? parseFloat(savedVolume) : 0.2;

        video_container.addEventListener('volumechange', function () {
            localStorage.setItem('videoVolume', video_container.volume);
        });

        return video;
    }

    //region set media src
    function setMediaSource(url, contentType) {
        switch (contentType) {
            case 'image':
                const image = createImageElement();
                image.src = url;
                break;
            case 'video':
                const video = createVideoElement();
                video.src = url;
                break;
            default:
                console.error('Unsupported file type:', contentType);
                break;
        }
    }

    //region Fetch and disp
    async function fetchAndDisplayFile(file_link, contentType) {
        // Поскольку мы просто привязываем ссылку, нет необходимости в fetch
        setMediaSource(file_link, contentType);
    }

    //region disp post data
    async function displayPostData(post_data) {
        const post_data_block = document.querySelector('.post-info');
        const post_arch = ['id', 'author', 'description', 'file', 'source', 'size', 'file_format', 'timestamp'];

        for (const data_line of post_arch) {
            const line_val = post_data[data_line];
            const elm = document.createElement('div');
            post_data_block.appendChild(elm);

            switch (data_line) {
                case 'id':
                    elm.innerHTML = `ID: ${line_val}`;
                    break;
                case 'author':
                    elm.innerHTML = `Создатель поста:\n`;
                    const act = createAction('', elm, () => {
                        window.location.href = `/profile?user=${line_val}`
                    })
                    parseUserLogin(line_val, act)
                    break;
                case 'description':
                    const desc = document.querySelector('.desc');
                    desc.innerText = line_val || 'Описание не обнаружено';
                    elm.remove()
                    break;
                case 'file':
                    elm.innerText = line_val.startsWith('WEB') ? 'Загружено через сайт' : 'Загружено через Telegram';
                    break;
                case 'source':
                    elm.innerText = line_val.length === 0 ? 'Источник(и) не указаны' : 'Источник(и):';
                    line_val.forEach(source => {
                        const src = document.createElement('div');
                        elm.appendChild(src);
                        src.innerText = source;
                    });
                    break;
                case 'size':
                    elm.innerText = `Размер:\n${line_val.x}x${line_val.y} (${formatFileSize(line_val.weight)})`;
                    break;
                case 'file_format':
                    const fileFormat = post_data.file.split('.').pop().toUpperCase()
                    elm.innerText = `Расширение файла: ${fileFormat}`
                    if (fileFormat == 'MP4' && !post_data.file.startsWith('WEB')) {
                        const audioWarning = document.createElement('div')
                        elm.appendChild(audioWarning)
                        audioWarning.innerHTML = '?'
                        audioWarning.className = 'audio-warning'
                        audioWarning.title = 'Это видео имеет формат MP4 и было загружено через Telegram-бота, возможно, это видео было гифкой, по этому может быть беззвучным!\nЕсли всё в порядке, не обращайте внимание на это уведомление.'
                    }
                    break
                case 'timestamp':
                    elm.innerText = `Пост создан: ${formatTimestamp(line_val)}`;
                    break;
            }
        }
    }

    //region format time
    function formatTimestamp(timestamp) {
        const currentdate = new Date(Math.floor(timestamp));
        return `${currentdate.getDate()}/${currentdate.getMonth() + 1}/${currentdate.getFullYear()} ${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()}`;
    }

    //region admin actions
    async function handleAdminActions() {
        const isOwner = await ownerVerify(post_data.author);
        const isAdmin = await adminVerify();

        if (isOwner || isAdmin) {
            createAction('Редактировать теги', document.querySelector('.post-actions'), async () => {
                let tagline = post_data.tags.join(' ');
                const taglist = await showPopup('Измените список тегов', tagline);
                if (taglist) {
                    const new_tags = taglist.split(/\s+|\n+/).filter(val => val !== '');
                    const rslt = await request('updateTags', { post: post_data.id, newTags: new_tags });
                    alert(rslt.msg, 5000);

                    const pData = await fetchPostData(post_data.id)
                    createTagSelector(pData.tags, document.querySelector('.tags'));
                }
            });

            createAction('Редактировать описание', document.querySelector('.post-actions'), async () => {
                const newDesc = await showPopup('Измените описание', post_data.description)
                if (newDesc) {
                    const updateResult = await request('updatePostDesc', { postID: post_data.id, newDesc: newDesc })
                    alert(`${updateResult.rslt}/${updateResult.msg}`, 5000)
                    if (updateResult.rslt == 's') {
                        document.querySelector('.view-container .desc').innerText = newDesc
                        post_data.description = newDesc
                    }
                }
            })

            if (post_data.postGroupData) {
                createAction(
                    'Удалить пост из группы',
                    document.querySelector('.post-actions'),
                    async () => {
                        if (confirm('Вы уверены что хотите удалить пост из группы?')) {
                            const removeResult = await request('controlGroup',
                                {
                                    type: 'removePost',
                                    postId: post_data.id,
                                    groupId: post_data.postGroupData.id
                                })
                            alert(`${removeResult.rslt}/${removeResult.msg}`, 5000)
                        }
                    })
                createAction(
                    'Изменить порядок постов в группе',
                    document.querySelector('.post-actions'),
                    () => {
                        const container = createBlurOverlay()

                        container.addEventListener('click', (e) => {
                            if (e.target === container) {
                                container.remove()
                            }
                        })

                        const reord_over = reorderOverlay(post_data.postGroupData, false, false, async (result, data) => {
                            switch (result) {
                                case 'cancel': {
                                    container.remove()
                                }; break;
                                case 'reorder': {
                                    const reorderResult = await request('controlGroup',
                                        {
                                            type: 'reorderGroup',
                                            newOrder: data,
                                            groupID: post_data.postGroupData.id
                                        })
                                    if (reorderResult.rslt == 's') {
                                        container.remove()
                                    }
                                    alert(`${reorderResult.rslt}/${reorderResult.msg}`)
                                }; break;
                            }
                        })
                        container.appendChild(reord_over)
                    }
                )
                if (post_data.postGroupData.type == 'group') {
                    createAction(
                        'Конвертировать группу в коллекцию',
                        document.querySelector('.post-actions'),
                        async () => {
                            if (confirm('вы уверены что хотите конвертировать эту коллекцию в группу?')) {
                                const convResult = await request('controlGroup',
                                    {
                                        type: 'setGroupType',
                                        newGroupType: 'collection',
                                        groupID: post_data.postGroupData.id
                                    })
                                alert(`${convResult.rslt}/${convResult.msg}`)
                            }
                        }
                    )
                } else {
                    createAction(
                        'Конвертировать коллекцию в группу',
                        document.querySelector('.post-actions'),
                        async () => {
                            if (confirm('вы уверены что хотите конвертировать эту коллекцию в группу?')) {
                                const convResult = await request('controlGroup',
                                    {
                                        type: 'setGroupType',
                                        newGroupType: 'group',
                                        groupID: post_data.postGroupData.id
                                    })
                                alert(`${convResult.rslt}/${convResult.msg}`)
                            }
                        }
                    )
                }

            } else {
                createAction('Добавить пост в группу', document.querySelector('.post-actions'), groupControl)
            }

            createAction('Удалить пост', document.querySelector('.post-actions'), async () => {
                if (!confirm(`Вы уверены что хотите удалить пост ID:${post_data.id}?`)) {
                    return
                }
                const rslt = await request('deletePost', { post: post_data.id });

                if (rslt.rslt == 's') {
                    search(rslt)
                } else {
                    alert(rslt.msg, 5000);
                }
            });
        }
    }

    //region group ctrl
    function groupControl() {
        return new Promise(async resolve => {
            const overlay = createBlurOverlay()
            overlay.addEventListener('click', (event) => {
                if (event.target === overlay) {
                    overlay.remove()
                    resolve(false)
                }
            })

            const group_control_container = createDiv('GC-container')
            overlay.appendChild(group_control_container)

            const label = createDiv('label')
            group_control_container.appendChild(label)
            label.innerHTML = 'Добавить пост в группу'

            const user_post_groups = await request('controlGroup', { type: 'getMyGroups' })
            console.log(user_post_groups)

            const groups_select = []
            groups_select.push({ name: 'Создать новую группу', value: 'create_group' })
            for (const grp of user_post_groups.groups) {
                groups_select.push({ name: `ID:${grp.id}|${grp.name}`, value: grp.id })
            }

            const group_selector = createSelect(groups_select, "Выберите группу", async (value) => {
                switch (value) {
                    case 'create_group': {
                        const groupName = await showPopup('Введите название коллекции')
                        if (groupName) {
                            const group_create_result = await request('controlGroup', { type: 'createGroup', posts: [post_data.id], name: groupName })
                            alert(group_create_result.rslt + '/' + group_create_result.msg, 5000)
                            if (group_create_result.rslt != 'e') {
                                overlay.remove()
                            }
                        }
                    }; break;
                    default: {
                        const group_add_result = await request('controlGroup', { type: 'addPost', post: post_data.id, id: value })
                        alert(group_add_result.rslt + '/' + group_add_result.msg, 5000)
                        if (group_add_result.rslt != 'e') {
                            overlay.remove()
                        }
                    }; break;
                }
            })
            group_control_container.appendChild(group_selector)
        })
    }

    //region init
    async function initialize() {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        const file_link = get_file_link(id);

        try {
            const post_data = await fetchPostData(id);

            console.log(post_data)
            displayPostData(post_data)

            createTagSelector(post_data.tags, document.querySelector('.tags'));
            createAction('Скачать файл', document.querySelector('.post-actions'), () => save_file(file_link, post_data.id));
            createAction('Создать временную ссылку на файл',
                document.querySelector('.post-actions'),
                () => {
                    const overlay = createBlurOverlay()

                    overlay.addEventListener('click', (e) => {
                        if (e.target === overlay) {
                            overlay.remove()
                        }
                    })

                    const sel = createSelect(
                        [
                            { name: '10 Минут', value: 1000 * 60 * 10 },
                            { name: '30 Минут', value: 1000 * 60 * 30 },
                            { name: '1 Час', value: 1000 * 60 * 60 },
                            { name: '5 Часов', value: 1000 * 60 * 60 * 5 },
                            { name: '10 Часов', value: 1000 * 60 * 60 * 10 },
                            { name: '24 Часа', value: 1000 * 60 * 60 * 24 },
                            { name: 'Бессрочный', value: 'infinite' },
                        ],
                        placeholder = "Время",
                        async (time) => {
                            if (time) {
                                const tempKeyRegisterRslt = await request('registerTempKey',
                                    {
                                        expires: time,
                                        post: post_data.id
                                    }
                                )
                                console.log(tempKeyRegisterRslt)
                                if (tempKeyRegisterRslt.rslt == 'e') {
                                    alert(`${tempKeyRegisterRslt.rslt}/${tempKeyRegisterRslt.msg}`)
                                } else {
                                    overlay.remove()

                                    const url = new URL(window.location.href)
                                    copyToClipboard(
                                        `${`${url.protocol}//${url.hostname}:${url.port}`}/file?tempKey=${tempKeyRegisterRslt.key}&id=${tempKeyRegisterRslt.post}`,
                                        `Временная ссылка скопирована`
                                    )
                                }

                            }
                        })
                    overlay.appendChild(sel)
                }
            )
            createAction('Установить как аватар', document.querySelector('.post-actions'), async () => {
                const rslt = await request('setPostAsUserAvatar', { postID: post_data.id })
                alert(rslt.msg, 5000)
            })
            createAction('Отправить пост в Телеграм', document.querySelector('.post-actions'), async (event) => {
                event.preventDefault()
                const rslt = await request('TGSendPostDM', { postID: post_data.id, isFile: event.shiftKey })

                alert(`${rslt.rslt}/${rslt.msg}`, 5000)
            })
            await handleAdminActions();

            const response = await fetch(file_link);
            const contentType = response.headers.get('Content-Type').split('/')[0];
            process_LDF()
            createComments()
            fetchAndDisplayFile(file_link, contentType)
            if (contentType == 'image') addOpenFullScreenView(file_link)
        } catch (error) {
            console.error(error);
        }
    }

    initialize();

    //region search
    document.getElementById('search-button').addEventListener('click', search);
    document.getElementById('taglist').addEventListener('keyup', (e) => {
        if (e.key == 'Enter') {
            search();
        }
    });
})();

//region comments
async function createComments() {
    const cr_comm_cont = document.querySelector('.new-comment-container')

    const text_input = document.createElement('textarea')
    cr_comm_cont.appendChild(text_input)
    text_input.placeholder = 'Введите комментарий'

    const msg_submit = document.createElement('input')
    cr_comm_cont.appendChild(msg_submit)
    msg_submit.type = 'button'
    msg_submit.value = 'Отправить'

    msg_submit.addEventListener('click', async () => {
        const commRslt = await request(
            'controlPostComments',
            {
                type: 'createComment',
                data: {
                    postID: post_data.id,
                    comment: formatUserText(text_input.value)
                }
            })
        text_input.value = ''
        alert(commRslt.rslt + '/' + commRslt.msg, 2000)
        fetchComments()
    })

    async function fetchComments() {
        const comment_list = document.querySelector('.comments-list')
        comment_list.innerHTML = ''

        const commentsFromServer = await request(
            'controlPostComments',
            {
                type: 'getPostComments',
                postID: post_data.id
            }
        )

        for (const comment of commentsFromServer.comments) {
            const comment_container = createDiv('comment-container', comment_list)

            const user_data_container = createDiv('user-data-container', comment_container)
            const comment_author = createAction('', user_data_container, () => {
                window.location.href = `/profile?user=${comment.from}`
            })
            parseUserLogin(comment.from, comment_author)

            const userAvatar = document.createElement('img')
            user_data_container.appendChild(userAvatar)
            const userAvatarID = (await request('getUserProfileData', { login: comment.from })).data.avatarpostid
            userAvatar.src = `/file?userKey=${localStorage.getItem('userKey') || sessionStorage.getItem('userKey')}&id=${userAvatarID}&thumb=true`
            userAvatar.setAttribute('onclick', `window.location.href='/view?id=${userAvatarID}'`)

            const comment_creation_date = createDiv('creation-date', user_data_container)
            comment_creation_date.innerHTML = parseTimestmap(comment.timestamp)

            const comment_data_container = createDiv('comment-data-container', comment_container)

            const comment_text_container = createDiv('comment-text-container', comment_data_container)
            const comment_text = createDiv('comment-text', comment_text_container)
            comment_text.innerHTML = comment.message

            const comment_actions_row = createDiv('comment-actions', comment_data_container)
            if ((await ownerVerify(comment.from)) || (await adminVerify())) {
                const comment_remove = createAction('Удалить', comment_actions_row, async () => {
                    if (!confirm('Вы точно хотите удалить комментарий?')) {
                        return
                    }
                    const rmResult = await request(
                        'controlPostComments',
                        {
                            type: 'deleteComment',
                            messageID: comment.messageid
                        }
                    )
                    if (rmResult.rslt == 's') {
                        fetchComments()
                    }
                    alert(rmResult.rslt + '/' + rmResult.msg, 2000)
                })
                comment_remove.classList.add('delete-button')
            }
        }
    }

    fetchComments()
}

//region L D F
async function process_LDF() {
    const container = document.querySelector('.score-n-fav')

    const userdata = await request('controlScoreAndFavs', { type: 'getUserInfo' })

    const vote_up = createButton('▲', container)

    if (userdata.likes.includes(post_data.id)) {
        vote_up.classList.add('liked')
    }

    const score = createDiv('score', container)

    const vote_down = createButton('▼', container)
    if (userdata.dislikes.includes(post_data.id)) {
        vote_down.classList.add('disliked')
    }

    const favourite = createDiv('fav', container)
    if (userdata.favs.includes(post_data.id)) {
        favourite.classList.add('faved')
    }


    const fav_counter = createDiv('fav-counter', favourite)

    const bmark = document.createElement('img')
    favourite.appendChild(bmark)
    bmark.src = 'fav.svg'
    bmark.className = 'bookmark-img'

    async function updateFavs() {
        const post_stats = await request('controlScoreAndFavs', { type: 'getPostScore', postID: post_data.id })
        if (post_stats.scores.favs != 0) {
            fav_counter.innerHTML = post_stats.scores.favs
            fav_counter.style.display = 'block'
        } else {
            fav_counter.style.display = 'none'
        }
    }
    updateFavs()

    favourite.addEventListener('click', async () => {
        if (favourite.classList.contains('faved')) {
            const favResult = await request('controlScoreAndFavs', { type: 'removeFavourite', postID: post_data.id })
            if (favResult.rslt == 'e') {
                alert(favResult.rslt + '/' + favResult.msg)
                return
            }
            favourite.classList.remove('faved')
        } else {
            const unfavResult = await request('controlScoreAndFavs', { type: 'addFavourite', postID: post_data.id })
            if (unfavResult.rslt == 'e') {
                alert(unfavResult.rslt + '/' + unfavResult.msg)
                return
            }
            favourite.classList.add('faved')
        }
        updateFavs()
    })

    async function updateScore() {
        const post_stats = await request('controlScoreAndFavs', { type: 'getPostScore', postID: post_data.id })
        const rating = post_stats.scores.likes - post_stats.scores.dislikes
        score.innerHTML = Math.abs(rating)
        switch (true) {
            case rating < 0: {
                score.innerHTML = '▼' + score.innerHTML
            }; break;
            case rating > 0: {
                score.innerHTML = '▲' + score.innerHTML
            }; break;
        }
    }

    updateScore()
    vote_up.addEventListener('click', async () => {
        if (vote_up.classList.contains('liked')) {
            const likeResult = await request('controlScoreAndFavs', { type: 'removeLike', postID: post_data.id })
            if (likeResult.rslt == 'e') {
                alert(likeResult.rslt + '/' + likeResult.msg)
                return
            }
            vote_up.classList.remove('liked')
        } else {
            const likeResult = await request('controlScoreAndFavs', { type: 'setLike', postID: post_data.id })
            if (likeResult.rslt == 'e') {
                alert(likeResult.rslt + '/' + likeResult.msg)
                return
            }
            vote_up.classList.add('liked')
            if (vote_down.classList.contains('disliked')) {
                const unlikeResult = await request('controlScoreAndFavs', { type: 'removeDislike', postID: post_data.id })
                if (unlikeResult.rslt == 'e') {
                    alert(unlikeResult.rslt + '/' + unlikeResult.msg)
                    return
                }
                vote_down.classList.remove('disliked')
            }
        }
        updateScore()
    })

    vote_down.addEventListener('click', async () => {
        if (vote_down.classList.contains('disliked')) {
            const unlikeResult = await request('controlScoreAndFavs', { type: 'removeDislike', postID: post_data.id })
            if (unlikeResult.rslt == 'e') {
                alert(unlikeResult.rslt + '/' + unlikeResult.msg)
                return
            }
            vote_down.classList.remove('disliked')
        } else {
            const unlikeResult = await request('controlScoreAndFavs', { type: 'setDislike', postID: post_data.id })
            if (unlikeResult.rslt == 'e') {
                alert(unlikeResult.rslt + '/' + unlikeResult.msg)
                return
            }
            vote_down.classList.add('disliked')
            if (vote_up.classList.contains('liked')) {
                const likeResult = await request('controlScoreAndFavs', { type: 'removeLike', postID: post_data.id })
                if (likeResult.rslt == 'e') {
                    alert(likeResult.rslt + '/' + likeResult.msg)
                    return
                }
                vote_up.classList.remove('liked')
            }
        }
        updateScore()
    })
}

//region F S V
function addOpenFullScreenView(file_link) {
    const fileContainer = document.querySelector('.file')

    const openFullScrView = createDiv('full-scree-view-button', fileContainer)

    const img = document.createElement('img')
    openFullScrView.appendChild(img)
    img.src = 'full-screen-view.svg'

    openFullScrView.addEventListener('click', () => {
        document.querySelector('html').style.overflow = 'hidden'

        const overlay = createBlurOverlay()

        function closeOverlay() {
            document.querySelector('html').removeAttribute('style')
            overlay.remove()
        }

        document.addEventListener(
            "keyup",
            (event) => {
                if (event.code == 'Escape') closeOverlay()
            }
        );

        const image = document.createElement('img')
        overlay.appendChild(image)
        image.src = file_link

        image.classList.add('movable-image')
        image.setAttribute('draggable', 'false')

        const closeBtn = createDiv('close-btn', overlay)
        closeBtn.addEventListener('click', closeOverlay)
        const clsBtnTxt = createDiv('label', closeBtn)
        clsBtnTxt.innerHTML = 'Закрыть'

        const baseX = image.getBoundingClientRect().width
        const baseY = image.getBoundingClientRect().height

        let isDragging = false;
        let startX, startY, initialX, initialY, scale = 1;

        // Функция для начала перетаскивания
        function startDrag(e) {
            isDragging = true;
            image.style.cursor = 'grabbing';

            // Определяем начальные координаты мыши или пальца
            startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
            startY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;

            // Запоминаем текущие позиции изображения
            const style = window.getComputedStyle(image);
            const matrix = new DOMMatrixReadOnly(style.transform);
            initialX = matrix.m41; // текущая позиция по X
            initialY = matrix.m42; // текущая позиция по Y

            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', stopDrag);
            document.addEventListener('touchmove', drag);
            document.addEventListener('touchend', stopDrag);
        }

        // Функция для перетаскивания
        function drag(e) {
            if (!isDragging) return;

            const currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
            const currentY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;

            const dx = currentX - startX;
            const dy = currentY - startY;

            image.style.transform = `translate(${initialX + dx}px, ${initialY + dy}px) scale(${scale})`;
        }

        // Функция для остановки перетаскивания
        function stopDrag() {
            isDragging = false;
            image.style.cursor = 'grab';

            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', stopDrag);
            document.removeEventListener('touchmove', drag);
            document.removeEventListener('touchend', stopDrag);
        }

        // Функция для масштабирования колесиком или на сенсорных устройствах
        function zoom(e) {
            e.preventDefault();

            // Определяем координаты точки зума (курсора мыши или пальца)
            const rect = image.getBoundingClientRect();
            const mouseX = e.type === 'wheel' ? e.clientX : e.touches[0].clientX;
            const mouseY = e.type === 'wheel' ? e.clientY : e.touches[0].clientY;

            const offsetX = (mouseX - rect.left) / rect.width;
            const offsetY = (mouseY - rect.top) / rect.height;

            // Определяем, увеличиваем или уменьшаем масштаб
            const zoomIntensity = 0.1;
            const previousScale = scale;
            scale += e.deltaY > 0 ? -zoomIntensity : zoomIntensity;
            scale = Math.min(Math.max(0.5, scale), 3); // Ограничение масштаба от 0.5 до 3

            // Рассчитываем смещение относительно точки зума
            const dx = (offsetX - 0.5) * baseX * (scale - previousScale);
            const dy = (offsetY - 0.5) * baseY * (scale - previousScale);

            const style = window.getComputedStyle(image);
            const matrix = new DOMMatrixReadOnly(style.transform);
            const currentX = matrix.m41;
            const currentY = matrix.m42;

            image.style.transform = `translate(${currentX - dx}px, ${currentY - dy}px) scale(${scale})`;
        }

        // Слушаем события для мыши и сенсорных устройств
        image.addEventListener('mousedown', startDrag);
        image.addEventListener('touchstart', startDrag);
        image.addEventListener('wheel', zoom);
    })
}

