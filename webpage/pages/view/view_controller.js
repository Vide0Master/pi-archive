let post_data;
const viewLang = Language.view
document.querySelector('.post-info .label').innerHTML = viewLang.postInfo
document.querySelector('.post-actions .label').innerHTML = viewLang.postActions
document.querySelector('.search-row #taglist').placeholder = Language.defaultTags

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
            setImageFit(localStorage.getItem('imageFit') || 'normal')
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
                document.querySelector('title').innerHTML = `${viewLang.headerNm} ${line_val}`
                break;
            case 'author':
                elm.innerHTML = `${viewLang.postData.author}: `;
                const act = createAction('', elm, () => {
                    window.location.href = `/profile?user=${line_val}`
                })
                parseUserLogin(line_val, act)
                break;
            case 'description':
                const desc = document.querySelector('.desc');
                if (!line_val) {
                    desc.remove()
                } else {
                    const descLabel = createDiv('desc-label', desc)
                    descLabel.innerHTML = viewLang.postData.descLabel
                    createDiv('desc-splitter', desc)
                    const descText = createDiv('desc-text', desc)
                    descText.innerText = line_val;
                }
                elm.remove()
                break;
            case 'file':
                elm.innerText = `${viewLang.postData.file}: ${line_val.split('-')[0]}`
                break;
            case 'source':
                elm.innerText = line_val.length === 0 ? viewLang.postData.source.none : viewLang.postData.source.present + " ⤵";
                line_val.forEach(source => {
                    const src = document.createElement('div');
                    elm.appendChild(src);
                    src.innerText = source;
                });
                break;
            case 'size':
                elm.innerText = `${viewLang.postData.size}:\n${line_val.x}x${line_val.y} (${formatFileSize(line_val.weight)})`;
                break;
            case 'file_format':
                const fileFormat = post_data.file.split('.').pop().toUpperCase()
                elm.innerText = `${viewLang.postData.fileFormat.filetype}: ${fileFormat}`
                if (fileFormat == 'MP4' && !post_data.file.startsWith('WEB')) {
                    const audioWarning = document.createElement('div')
                    elm.appendChild(audioWarning)
                    audioWarning.innerHTML = '?'
                    audioWarning.className = 'audio-warning'
                    audioWarning.title = viewLang.postData.fileFormat.tgAudioWarn
                }
                break
            case 'timestamp':
                elm.innerText = `${viewLang.postData.creation}: ${parseTimestamp(line_val)}`;
                break;
        }
    }
}

//region admin actions
async function handleAdminActions() {
    const isOwner = await ownerVerify(post_data.author);
    const isAdmin = await adminVerify();

    if (isOwner || isAdmin) {
        createAction(viewLang.actions.editTags.btn, document.querySelector('.post-actions'), async () => {
            let tagline = post_data.tags.join(' ');
            const { txtArea, txtAreaCont } = showPopupInput(viewLang.actions.editTags.poptext, tagline, async (taglist) => {
                if (taglist) {
                    const new_tags = taglist.split(/\s+|\n+/).filter(val => val !== '');
                    const rslt = await request('updateTags', { post: post_data.id, newTags: new_tags });
                    alert(rslt.msg, 5000);

                    const pData = await fetchPostData(post_data.id)
                    createTagSelector(pData.tags, document.querySelector('.tags'));
                }
            });
            addTagsAutofill(txtArea, txtAreaCont, true)
        });

        createAction(viewLang.actions.editDesc.btn, document.querySelector('.post-actions'), async () => {
            showPopupInput(viewLang.actions.editDesc.poptext, post_data.description, async (newDesc) => {
                if (newDesc) {
                    const updateResult = await request('updatePostDesc', { postID: post_data.id, newDesc: newDesc })
                    alert(`${updateResult.rslt}/${updateResult.msg}`, 5000)
                    if (updateResult.rslt == 's') {
                        document.querySelector('.view-container .desc').innerText = newDesc
                        post_data.description = newDesc
                    }
                }
            })
        })

        if (post_data.postGroupData) {
            createAction(
                `${viewLang.actions.rmFromGroup.btn}\n"${post_data.postGroupData.name}"`,
                document.querySelector('.post-actions'),
                async () => {
                    if (confirm(`${viewLang.actions.rmFromGroup.poptext} "${post_data.postGroupData.name}"`)) {
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
                viewLang.actions.editGroup.actName,
                document.querySelector('.post-actions'),
                () => {
                    const container = createBlurOverlay()

                    container.addEventListener('click', (e) => {
                        if (e.target === container) {
                            container.remove()
                        }
                    })

                    const reord_over = reorderOverlay(post_data.postGroupData, async (result, data) => {
                        switch (result) {
                            case 'cancel': {
                                container.remove()
                            }; break;
                            case 'delete': {
                                if (confirm(`${viewLang.actions.editGroup.delete.grp} ${post_data.postGroupData.name}`)) {
                                    const deleteResult = await request('controlGroup',
                                        {
                                            type: 'deleteGroup',
                                            groupID: post_data.postGroupData.id
                                        })
                                    if (deleteResult.rslt == 's') {
                                        container.remove()
                                        alert(`s/${viewLang.actions.editGroup.delete.grps}`)
                                    } else {
                                        alert(`${deleteResult.rslt}/${deleteResult.msg}`, 5000)
                                    }
                                }
                            }; break;
                            case 'fullDelete': {
                                if (confirm(`${viewLang.actions.editGroup.delete.psts} "${post_data.postGroupData.name}"`)) {
                                    for (const post of post_data.postGroupData.group) {
                                        const rslt = await request('deletePost', { post: post });
                                        if (rslt.rslt == 'e') alert(rslt.rslt + '/' + rslt.msg)
                                    }
                                    const deleteResult = await request('controlGroup', {
                                        type: 'deleteGroup',
                                        groupID: post_data.postGroupData.id
                                    })

                                    if (deleteResult.rslt == 'e') alert(`${deleteResult.rslt}/${deleteResult.msg}`)

                                    if (deleteResult.rslt == 's') {
                                        container.remove()
                                        alert(`s/${viewLang.actions.editGroup.delete.pstss}`)
                                    }
                                }
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
                                alert(`${reorderResult.rslt}/${reorderResult.msg}`, 5000)
                            }; break;
                            case 'rename': {
                                container.remove()
                                showPopupInput(viewLang.actions.editGroup.rename, post_data.postGroupData.name, async (new_name) => {
                                    if (new_name) {
                                        const rename_result = await request('controlGroup',
                                            {
                                                type: 'renameGroup',
                                                groupID: post_data.postGroupData.id,
                                                newName: new_name
                                            })
                                        alert(`${rename_result.rslt}/${rename_result.msg}`, 5000)
                                    }
                                })
                            }; break;
                            case 'color': {
                                const color_result = await request('controlGroup',
                                    {
                                        type: 'setGroupColor',
                                        groupID: post_data.postGroupData.id,
                                        newColor: data
                                    })
                                alert(`${color_result.rslt}/${color_result.msg}`, 5000)
                            }; break;
                        }
                    })
                    container.appendChild(reord_over)
                }
            )
            if (post_data.postGroupData.type == 'group') {
                createAction(
                    viewLang.actions.editGroup.toColl.btn,
                    document.querySelector('.post-actions'),
                    async () => {
                        if (confirm(viewLang.actions.editGroup.toColl.conf)) {
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
                    viewLang.actions.editGroup.toGroup.btn,
                    document.querySelector('.post-actions'),
                    async () => {
                        if (confirm(viewLang.actions.editGroup.toGroup.conf)) {
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
            createAction(viewLang.actions.editGroup.addToGroup, document.querySelector('.post-actions'), groupControl)
        }

        createAction(viewLang.actions.rmPost.btn, document.querySelector('.post-actions'), async () => {
            if (!confirm(`${viewLang.actions.rmPost.conf} ID:${post_data.id}?`)) {
                return
            }
            const rslt = await request('deletePost', { post: post_data.id });

            if (rslt.rslt == 's') {
                search(document.getElementById('taglist').value, rslt)
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
        label.innerHTML = viewLang.actions.groupControl.addToGroupLabel

        const user_post_groups = await request('controlGroup', { type: 'getMyGroups' })

        const groups_select = []
        groups_select.push({ name: viewLang.actions.groupControl.createNewGroup, value: 'create_group' })
        for (const grp of user_post_groups.groups) {
            groups_select.push({ name: `ID:${grp.id}|${grp.name}`, value: grp.id })
        }

        const group_selector = createSelect(groups_select, viewLang.actions.groupControl.selectGroupLabel, async (value) => {
            switch (value) {
                case 'create_group': {
                    showPopupInput(viewLang.actions.groupControl.newGroupNameLabel, "", async (groupName) => {
                        if (groupName) {
                            const group_create_result = await request('controlGroup', { type: 'createGroup', posts: [post_data.id], name: groupName })
                            alert(group_create_result.rslt + '/' + group_create_result.msg, 5000)
                            if (group_create_result.rslt != 'e') {
                                overlay.remove()
                            }
                        }
                    })
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

        const response = await fetch(file_link);
        const contentType = response.headers.get('Content-Type').split('/')[0];

        displayPostData(post_data)

        createTagSelector(post_data.tags, document.querySelector('.tags'));
        createAction(viewLang.actions.download, document.querySelector('.post-actions'), () => save_file(file_link, post_data.id));
        createAction(viewLang.actions.tempLink.btn,
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
                        { name: `10 ${viewLang.actions.tempLink.times[0]}`, value: 1000 * 60 * 10 },
                        { name: `30 ${viewLang.actions.tempLink.times[1]}`, value: 1000 * 60 * 30 },
                        { name: `1 ${viewLang.actions.tempLink.times[2]}`, value: 1000 * 60 * 60 },
                        { name: `5 ${viewLang.actions.tempLink.times[3]}`, value: 1000 * 60 * 60 * 5 },
                        { name: `10 ${viewLang.actions.tempLink.times[4]}`, value: 1000 * 60 * 60 * 10 },
                        { name: `24 ${viewLang.actions.tempLink.times[5]}`, value: 1000 * 60 * 60 * 24 },
                        { name: `${viewLang.actions.tempLink.times[6]}`, value: 'infinite' },
                    ],
                    placeholder = viewLang.actions.tempLink.timeLabel,
                    async (time) => {
                        if (time) {
                            const tempKeyRegisterRslt = await request('registerTempKey',
                                {
                                    expires: time,
                                    post: post_data.id
                                }
                            )
                            if (tempKeyRegisterRslt.rslt == 'e') {
                                alert(`${tempKeyRegisterRslt.rslt}/${tempKeyRegisterRslt.msg}`)
                            } else {
                                overlay.remove()
                                const url = new URL(window.location.href)
                                copyToClipboard(
                                    `${`${url.protocol}//${url.hostname}:${url.port}`}/file?tempKey=${tempKeyRegisterRslt.key}&id=${tempKeyRegisterRslt.post}`,
                                    viewLang.actions.tempLink.TLCopied
                                )
                            }
                        }
                    })
                overlay.appendChild(sel)
            }
        )

        if (contentType != 'video') {
            // region set avatar
            createAction(viewLang.actions.setPostAsAvatar, document.querySelector('.post-actions'), async () => {
                const rslt = await request('controlUserSettings', { type: 'update', update: { ProfileAvatarPostID: post_data.id } })
                alert(rslt.msg, 5000)
            })

            // region set background
            createAction(viewLang.actions.setPostAsProfileBackground, document.querySelector('.post-actions'), async () => {
                const rslt = await request('controlUserSettings', { type: 'update', update: { ProfileBackgroundPostID: post_data.id } })
                alert(rslt.msg, 5000)
            })
        }

        // region send post to tg
        createAction(viewLang.actions.sendPostToTg, document.querySelector('.post-actions'), async (event) => {
            event.preventDefault()
            const rslt = await request('TGSendPostDM', { postID: post_data.id, isFile: event.shiftKey })

            alert(`${rslt.rslt}/${rslt.msg}`, 5000)
        })
        await handleAdminActions();

        process_LDF()
        if (post_data.postGroupData) {
            processGroupData(post_data.postGroupData)
        } else {
            document.querySelector('.group-info').remove()
        }
        createComments()
        fetchAndDisplayFile(file_link, contentType)
        if (contentType == 'image') {
            addOpenFullScreenView(file_link)
            addResSwitch()
        }
    } catch (error) {
        console.error(error);
    }
}

initialize();

//region comments
async function createComments() {
    const cr_comm_cont = document.querySelector('.new-comment-container')

    const text_input = document.createElement('textarea')
    cr_comm_cont.appendChild(text_input)
    text_input.placeholder = viewLang.comments.writeComment

    const msg_submit = document.createElement('input')
    cr_comm_cont.appendChild(msg_submit)
    msg_submit.type = 'button'
    msg_submit.value = viewLang.comments.sendComment

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

            const userData = await request('getUserProfileData', { login: comment.from })
            const userAvatarID = userData.data.usersettings.ProfileAvatarPostID
            if (userAvatarID) {
                const userAvatar = document.createElement('img')
                user_data_container.appendChild(userAvatar)
                userAvatar.src = `/file?userKey=${localStorage.getItem('userKey') || sessionStorage.getItem('userKey')}&id=${userAvatarID}&thumb=true`
                userAvatar.setAttribute('onclick', `window.location.href='/view?id=${userAvatarID}'`)
            }

            const comment_creation_date = createDiv('creation-date', user_data_container)
            comment_creation_date.innerHTML = parseTimestamp(comment.timestamp)

            const comment_data_container = createDiv('comment-data-container', comment_container)

            const comment_text_container = createDiv('comment-text-container', comment_data_container)
            const comment_text = createDiv('comment-text', comment_text_container)
            comment_text.innerHTML = comment.message

            const comment_actions_row = createDiv('comment-actions', comment_data_container)
            if ((await ownerVerify(comment.from)) || (await adminVerify())) {
                const comment_remove = createAction(viewLang.comments.deleteComment.btn, comment_actions_row, async () => {
                    if (!confirm(viewLang.comments.deleteComment.conf)) {
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

    const positiveBar = createDiv('positive', score)

    const negativeBar = createDiv('negative', score)

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

        vote_up.value = post_stats.scores.likes > 0 ? post_stats.scores.likes + '▲' : '▲';
        vote_down.value = post_stats.scores.dislikes > 0 ? post_stats.scores.dislikes + '▼' : '▼';

        const likes = parseFloat(post_stats.scores.likes) || 0;
        const dislikes = parseFloat(post_stats.scores.dislikes) || 0;

        const total = likes + dislikes;

        if (total === 0) {
            positiveBar.style.width = `0`;
            negativeBar.style.width = `0`;
        } else {
            const positiveScCoef = (likes / total) * 100;
            const negativeScCoef = (dislikes / total) * 100;

            positiveBar.style.width = `calc(${positiveScCoef}% - 1px)`;
            negativeBar.style.width = `calc(${negativeScCoef}% - 1px)`;
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

    openFullScrView.addEventListener('mousedown', (e) => {
        e.preventDefault()
        if (e.ctrlKey || e.button == 1) {
            window.open(file_link, '_blank').focus();
            return
        }

        document.querySelector('html').style.overflow = 'hidden'

        const overlay = createBlurOverlay()

        function closeOverlay() {
            document.querySelector('html').removeAttribute('style')
            overlay.remove()
        }

        overlay.addEventListener('click', (e) => {
            if (e.target == overlay) closeOverlay()
        })

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

        const baseX = image.getBoundingClientRect().width
        const baseY = image.getBoundingClientRect().height

        let isDragging = false;
        let startX, startY, initialX, initialY, scale = 1;

        function startDrag(e) {
            isDragging = true;
            image.style.cursor = 'grabbing';

            startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
            startY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;

            const style = window.getComputedStyle(image);
            const matrix = new DOMMatrixReadOnly(style.transform);
            initialX = matrix.m41;
            initialY = matrix.m42;

            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', stopDrag);
            document.addEventListener('touchmove', drag);
            document.addEventListener('touchend', stopDrag);
        }

        function drag(e) {
            if (!isDragging) return;

            const currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
            const currentY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;

            const dx = currentX - startX;
            const dy = currentY - startY;

            image.style.transform = `translate(${initialX + dx}px, ${initialY + dy}px) scale(${scale})`;
        }

        function stopDrag() {
            isDragging = false;
            image.style.cursor = 'grab';

            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', stopDrag);
            document.removeEventListener('touchmove', drag);
            document.removeEventListener('touchend', stopDrag);
        }

        function zoom(e) {
            e.preventDefault();

            const rect = image.getBoundingClientRect();
            const mouseX = e.type === 'wheel' ? e.clientX : e.touches[0].clientX;
            const mouseY = e.type === 'wheel' ? e.clientY : e.touches[0].clientY;

            const offsetX = (mouseX - rect.left) / rect.width;
            const offsetY = (mouseY - rect.top) / rect.height;

            const zoomIntensity = 0.1;
            const previousScale = scale;
            scale += e.deltaY > 0 ? -zoomIntensity : zoomIntensity;
            scale = Math.min(Math.max(0.1, scale), 3);

            const dx = (offsetX - 0.5) * baseX * (scale - previousScale);
            const dy = (offsetY - 0.5) * baseY * (scale - previousScale);

            const style = window.getComputedStyle(image);
            const matrix = new DOMMatrixReadOnly(style.transform);
            const currentX = matrix.m41;
            const currentY = matrix.m42;

            image.style.transform = `translate(${currentX - dx}px, ${currentY - dy}px) scale(${scale})`;
        }

        image.addEventListener('mousedown', startDrag);
        image.addEventListener('touchstart', startDrag);
        image.addEventListener('wheel', zoom);
    })
}

//region P S T SF
function passSearchTagsToSearchField() {
    document.getElementById('taglist').value = new URLSearchParams(window.location.search).get('tags')
}

passSearchTagsToSearchField()

function processGroupData(postGroup) {
    const container = document.querySelector('.group-info')
    container.appendChild(createGroup(postGroup))
}

//region resolution switch

function addResSwitch() {
    const fileContainer = document.querySelector('.file')

    const resSelect = createDiv('resolution-selector', fileContainer)

    const dropDown = createSelect(
        [
            { name: Language.view.fit.fits.normal + '(700px)', value: 'normal' },
            { name: Language.view.fit.fits.horizontal, value: 'horizontal' },
            { name: Language.view.fit.fits.vertical, value: 'vertical' }
        ],
        Language.view.fit.label, (result) => setImageFit(result))
    resSelect.appendChild(dropDown)
}

function setImageFit(fit) {
    const img = document.querySelector('.file').querySelector('img')

    const postBaseLink = get_file_link(post_data.id)

    switch (fit) {
        case 'normal': img.src = postBaseLink + `&h=700`; break;
        case 'horizontal': img.src = postBaseLink; break;
        case 'vertical': img.src = postBaseLink + `&h=${screen.height}`; break;
    }
}