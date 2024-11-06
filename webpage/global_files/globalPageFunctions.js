setHeaderButtrons()

//region head buttons
async function setHeaderButtrons() {
    const headerLang = Language.header
    const user_acc = await request('AuthyPageAccessCheck', {
        page: window.location.pathname.replace(/\//g, ''),
        userKey: localStorage.getItem('userKey') || sessionStorage.getItem('userKey')
    })
    const pages = [
        { name: headerLang[0], link: '/search', restr: 1 },
        { name: headerLang[1], link: '/post', restr: 1 },
        { name: headerLang[3], link: '/messages', restr: 1 },
        { name: headerLang[2], link: '/profile', restr: 1 },
        { name: headerLang[4], link: '/admin', restr: 2 }
    ]

    const navigator = document.querySelector('header .nav-row')

    for (const page of pages) {
        if (page.restr <= user_acc.perm_level) {
            const link = createAction(page.name, navigator, () => { })
            link.className = page.link.substring(1)
            link.href = page.link
        }
    }

    getMessageCount()
}

//region cr action
function createAction(name, parentElement, cb) {
    const action = document.createElement('a');
    parentElement.appendChild(action);
    action.innerText = name;
    action.addEventListener('click', cb);
    return action
}

//region cr Pcard
function createPostCard(postData, noClickReaction) {
    const postCardLang = Language.postCard
    const postCard = document.createElement('div')
    postCard.className = 'post-card'
    if (!noClickReaction)
        postCard.addEventListener('mousedown', (event) => {
            if (event.button === 1)
                event.preventDefault()
            if ((event.button === 0 && event.ctrlKey) || event.button === 1) {
                window.open(`/view?id=${postData.id}`, '_blank').focus();
                return
            }
            window.location.href = `/view?id=${postData.id}`
        })

    const preview_container = createDiv('preview-container')
    postCard.appendChild(preview_container)

    const preview = document.createElement('img')
    preview_container.appendChild(preview)
    preview.src = `/file?userKey=${localStorage.getItem('userKey') || sessionStorage.getItem('userKey')}&id=${postData.id}&thumb=true`
    preview.className = 'preview-image'

    const info_row = document.createElement('div')
    postCard.appendChild(info_row)
    info_row.className = 'info-row'

    const postScore = createDiv('', info_row)
    postScore.title = postCardLang.rating

    function updateScore() {
        const post_stats = postData.postRating
        const rating = post_stats.likes - post_stats.dislikes
        postScore.innerHTML = Math.abs(rating)
        switch (true) {
            case rating < 0: {
                postScore.innerHTML = '▼' + postScore.innerHTML
                postScore.style.color = 'rgb(200, 0, 0)'
            }; break;
            case rating > 0: {
                postScore.innerHTML = '▲' + postScore.innerHTML
                postScore.style.color = 'rgb(0, 200, 0)'
            }; break;
        }
    }
    updateScore()

    async function setFav() {
        if ((await request('controlScoreAndFavs', { type: 'getUserInfo' })).favs.includes(postData.id)) {
            const fav = createDiv('fav')
            fav.title = postCardLang.fav
            info_row.prepend(fav)

            const favImg = document.createElement('img')
            fav.appendChild(favImg)
            favImg.src = 'fav.svg'
        }
    }
    setFav()

    const postID = createDiv('', info_row)
    postID.innerHTML = `ID:${postData.id}`
    postID.title = postCardLang.id

    const postCommentsCount = createDiv('', info_row)
    postCommentsCount.innerHTML = `C:${postData.commentCount}`
    postCommentsCount.title = postCardLang.CC

    function getFileExtension(filename) {
        const parts = filename.split('.');
        return parts.length > 1 ? parts.pop() : '';
    }

    if (['mp4', 'mov', 'avi', 'mkv', 'gif'].includes(getFileExtension(postData.file))) {
        const video_ind_cont = createDiv('video-indicator')
        preview_container.appendChild(video_ind_cont)

        const ind_img = document.createElement('img')
        video_ind_cont.appendChild(ind_img)
        ind_img.src = 'video-indicator.svg'
    }

    const defins = [
        { type: '4K<br>UHD', active: (postData.size.y > 2160) },
        { type: '1440<br>QHD', active: (postData.size.y > 1440) },
        { type: '1080<br>FHD', active: (postData.size.y > 1080) },
        { type: '720<br>HD', active: (postData.size.y > 720) }
    ]

    for (const res of defins) {
        if (res.active) {
            const hd_indicator_cont = createDiv('hd-indicator')
            preview_container.appendChild(hd_indicator_cont)

            const text = createDiv()
            hd_indicator_cont.appendChild(text)
            text.innerHTML = res.type
            break
        }
    }

    function timeSinceCreation(time) {
        const date1 = Date.now();
        const date2 = new Date(time);
        const differenceInMilliseconds = Math.abs(date2 - date1);
        const differenceInHours = differenceInMilliseconds / (1000 * 60 * 60);
        return differenceInHours;
    }

    const warning_container = createDiv('warning-container')
    preview_container.appendChild(warning_container)

    if (timeSinceCreation(postData.timestamp) < 5) {
        const new_ribbon = createDiv('new-ribbon')
        warning_container.appendChild(new_ribbon)

        const text = createDiv('ribbon-text')
        new_ribbon.appendChild(text)
        text.innerHTML = postCardLang.newPost
    }

    if (postData.tags.length < 5) {
        const low_tags = createDiv('low-tags-ribbon')
        warning_container.appendChild(low_tags)

        const text = createDiv('ribbon-text')
        low_tags.appendChild(text)

        if (postData.tags.length == 0) {
            text.innerHTML = postCardLang.LTA[0]
        } else {
            text.innerHTML = postCardLang.LTA[1]
        }
    }

    return postCard
}

setFooterText()

//region footer text
function setFooterText() {
    const footerLang = Language.footer

    const footer = document.querySelector('footer')
    footer.innerHTML = ''

    const main_text = createDiv('main-text', footer)
    main_text.innerHTML = footerLang.disclaimer

    const actions = createDiv('actions-row', footer)

    createAction('EULA', actions, () => {
        window.open('/eula', '_blank').focus();
    }).title = footerLang.eula

    createAction('Github', actions, () => {
        window.open('https://github.com/Vide0Master/pi-archive', '_blank').focus();
    }).title = footerLang.github

    createAction(footerLang.tgbot[0], actions, async () => {
        window.open('https://t.me/pi_archive_bot', '_blank').focus();
    }).title = footerLang.tgbot[1]

    //createIndicator('g', sysLabel)

    const sysHealthInfoContainer = createDiv('sys-health-container', footer)

    const sysHealthSizer = createDiv('sys-health-sizer', sysHealthInfoContainer)
    const sysLabelSizer = createDiv('', sysHealthSizer)
    sysLabelSizer.innerHTML = footerLang.status.label

    const sysHealth = createDiv('sys-healt-info', sysHealthInfoContainer)
    const sysLabel = createDiv('', sysHealth)
    sysLabel.innerHTML = footerLang.status.label

    const elementCont = createDiv('elements-container', sysHealth)

    const versions = createDiv('version-list', elementCont)
    const verLabel = createDiv('vlabel', versions)
    verLabel.innerHTML = footerLang.status.vLabel

    async function getVers() {
        const versInfo = await request('getVersionInfo')
        for (const ver in versInfo) {
            const verBlock = createDiv('', versions)
            verBlock.innerHTML = `${ver}: ${versInfo[ver]}`
        }
    }
    getVers()

    // const systemRepots = createDiv('sysRepCont', elementCont)
    // const sysRepLabel = createDiv('label',systemRepots)
    // sysRepLabel.innerHTML = footerLang.status.systemReports
}

PInav()

//region circ ind
function createIndicator(state, parent) {
    const elem = createDiv('indicator', parent)
    elem.classList.add(state)
    return elem
}

//region PI-nav
function PInav() {
    document.querySelector('header .label').addEventListener('click', () => {
        window.location.href = '/search'
    })
}

//region cr Div
function createDiv(className, parentElem) {
    const div = document.createElement('div')
    !!className ? div.className = className : {}
    if (parentElem) {
        parentElem.appendChild(div)
    }
    return div
}

//region cr Button
function createButton(name, parentElem) {
    const btn = document.createElement('input')
    btn.type = 'button'
    btn.value = name
    if (parentElem) {
        parentElem.appendChild(btn)
    }
    return btn
}

//region cr blur
function createBlurOverlay() {
    const overlay = createDiv('blurry-overlay')
    document.body.appendChild(overlay);
    return overlay
}

//region Message count
async function getMessageCount() {
    const msgCountLang = Language.msgCount
    const count = await request('getUserMessageCount')

    if (count.outUnread > 0 || count.inUnread > 0) {
        const messages_link = document.querySelector('.nav-row').querySelector('.messages')

        const counter = createDiv('counter')
        messages_link.appendChild(counter)

        if (count.requiredAction) {
            counter.style.backgroundColor = '#a53030'
            counter.innerText = '!'
            counter.title = msgCountLang[0]
            return
        }

        if (count.outUnread > 0) {
            const countOut = createDiv()
            countOut.innerText = "▲" + count.outUnread
            countOut.title = msgCountLang[1]
            counter.appendChild(countOut)
        }

        if (count.outUnread > 0 && count.inUnread > 0) {
            const splitter = createDiv('splitter')
            counter.appendChild(splitter)
        }

        if (count.inUnread > 0) {
            const countIn = createDiv()
            countIn.innerText = "▼" + count.inUnread
            countIn.title = msgCountLang[2]
            counter.appendChild(countIn)
        }
    }
}

//region Parse user
function parseUserLogin(login, elem) {
    (async () => {
        const user = await request('getUserProfileData', { login })
        let color = ''
        try {
            if (user.data.trueUserStatus) {
                color = user.data.trueUserStatus
            }
        } catch { }

        const userDiv = createDiv(`user-block ${color}`)
        userDiv.innerHTML = user.data.username

        const userNameBlock = createDiv('shine')
        userDiv.appendChild(userNameBlock)

        userNameBlock.innerHTML = user.data.username

        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        userDiv.title = capitalizeFirstLetter(Language.user_status_translation[user.data.status])
        elem.appendChild(userDiv)
    })()
}

//region create group
function createGroup(groupData) {
    const groupElem = createDiv('group-line')
    groupElem.style.setProperty('--borderclr', groupData.color)

    const actionRow = createDiv('action-row', groupElem)
    const groupName = createDiv('group-name', actionRow)
    groupName.innerHTML = groupData.name
    createDiv('splitter', groupElem)

    if (groupData.type == 'collection') {
        const openAsColl = createButton(Language.group.colView, actionRow)
        openAsColl.addEventListener('mousedown', (event) => {
            if (event.button === 1)
                event.preventDefault()
            if ((event.button === 0 && event.ctrlKey) || event.button === 1) {
                window.open(`/collection?id=${groupData.id}`, '_blank').focus();
                return
            }
            window.location.href = `/collection?id=${groupData.id}`
        })
    }

    const list = createDiv('list', groupElem)
    const GROUPER = async () => {
        for (const post of groupData.group) {
            list.append(createPostCard((await request('getPostData', { id: post })).post))
        }
    }
    GROUPER()

    return groupElem
}

//region create coll
function createCollection(collectionData) {
    const colCont = createDiv('collection-container')
    const colNnBrow = createDiv('action-row', colCont)
    createDiv('splitter', colCont)
    const list = createDiv('posts-list', colCont)

    const name = createDiv('group-name', colNnBrow)
    name.innerHTML = collectionData.name



    async function COLLECTIONER() {
        for (const pageID of collectionData.group) {
            list.appendChild(createPostCard((await request('getPostData', { id: pageID })).post))
        }
    }
    COLLECTIONER()

    return colCont
}

//region cr select
function createSelect(list, placeholder = '', onChangeCallback) {

    const selectElement = document.createElement('select');

    if (placeholder) {
        const placeholderOption = document.createElement('option');
        placeholderOption.value = '';
        placeholderOption.textContent = placeholder;
        placeholderOption.disabled = true;
        placeholderOption.selected = true;
        placeholderOption.hidden = true;
        selectElement.appendChild(placeholderOption);
    }

    list.forEach(item => {
        const option = document.createElement('option');
        option.value = item.value;
        option.textContent = item.name;
        selectElement.appendChild(option);
    });

    selectElement.addEventListener('change', () => {
        const selectedValue = selectElement.value;
        onChangeCallback(selectedValue);
    });

    return selectElement;
}

//region create reorderer
function reorderOverlay(group, callback) {
    const container = createDiv('reorderer-container');

    const RENDER = async () => {
        const label = createDiv('label');
        container.appendChild(label);
        label.innerText = `${group.id}|${group.name}`;

        const reorderContainer = createDiv('reord-cont');
        container.appendChild(reorderContainer);

        const idToElementMap = new Map();

        for (const ID of group.group) {
            const postData = await request('getPostData', { id: ID });
            if (postData.rslt != 's') {
                alert(`${postData.rslt}/${postData.msg}`)
                container.remove()
                return
            }
            const pcard = createPostCard(postData.post, true);
            pcard.draggable = true;
            pcard.dataset.id = ID;
            idToElementMap.set(ID, pcard);
            reorderContainer.appendChild(pcard);
        }

        let draggedItem = null;
        let selectedItem = null;

        reorderContainer.addEventListener('dragstart', (e) => {
            if (e.target.closest('.post-card')) {
                draggedItem = e.target.closest('.post-card');
                draggedItem.classList.add('dragging');
            }
        });

        reorderContainer.addEventListener('dragend', (e) => {
            if (draggedItem) {
                draggedItem.classList.remove('dragging');
                draggedItem = null;
            }
            updateOrder();
        });

        reorderContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        reorderContainer.addEventListener('dragenter', (e) => {
            const target = e.target.closest('.post-card');
            if (target && target !== draggedItem) {
                target.classList.add('over');
            }
        });

        reorderContainer.addEventListener('dragleave', (e) => {
            const target = e.target.closest('.post-card');
            if (target && target !== draggedItem) {
                target.classList.remove('over');
            }
        });

        reorderContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            const target = e.target.closest('.post-card');
            if (target && target !== draggedItem) {
                const allItems = Array.from(reorderContainer.querySelectorAll('.post-card'));
                const draggedIndex = allItems.indexOf(draggedItem);
                const targetIndex = allItems.indexOf(target);

                if (draggedIndex < targetIndex) {
                    reorderContainer.insertBefore(draggedItem, target.nextSibling);
                } else {
                    reorderContainer.insertBefore(draggedItem, target);
                }

                target.classList.remove('over');
            }
        });

        function updateOrder() {
            const items = Array.from(reorderContainer.querySelectorAll('.post-card'));
            const order = items.map(item => item.dataset.id);
        }

        reorderContainer.addEventListener('click', (e) => {
            const target = e.target.closest('.post-card');
            if (target && target !== selectedItem) {
                if (selectedItem) {
                    selectedItem.classList.remove('selected');
                }
                selectedItem = target;
                selectedItem.classList.add('selected');
            } else if (target === selectedItem) {
                selectedItem.classList.remove('selected');
                selectedItem = null;
            }
        });

        reorderContainer.addEventListener('click', (e) => {
            const target = e.target.closest('.post-card');
            if (target && selectedItem && target !== selectedItem) {
                const allItems = Array.from(reorderContainer.querySelectorAll('.post-card'));
                const selectedIndex = allItems.indexOf(selectedItem);
                const targetIndex = allItems.indexOf(target);

                if (selectedIndex < targetIndex) {
                    reorderContainer.insertBefore(selectedItem, target.nextSibling);
                } else {
                    reorderContainer.insertBefore(selectedItem, target);
                }

                selectedItem.classList.remove('selected');
                selectedItem = null;
                updateOrder();
            }
        });

        const button_row = createDiv('button-row');
        container.appendChild(button_row);

        const editorLng = Language.group.editor

        const cancel_btn = createButton(editorLng.cancel);
        button_row.appendChild(cancel_btn);
        cancel_btn.addEventListener('click', () => {
            callback('cancel')
        });

        const delete_btn = createButton(editorLng.delete);
        delete_btn.style.backgroundColor = 'red';
        button_row.appendChild(delete_btn);
        delete_btn.addEventListener('click', () => {
            callback('delete')
        });

        const rename_btn = createButton(editorLng.rename);
        button_row.appendChild(rename_btn);
        rename_btn.addEventListener('click', () => {
            callback('rename')
        });

        const colorSel = document.createElement('input')
        button_row.appendChild(colorSel);
        colorSel.type = 'color'
        colorSel.value = group.color
        colorSel.title = editorLng.color
        colorSel.addEventListener('change', () => {
            callback('color', colorSel.value)
        })

        const confirm_btn = createButton(editorLng.accept);
        button_row.appendChild(confirm_btn);
        confirm_btn.addEventListener('click', () => {
            const items = Array.from(reorderContainer.querySelectorAll('.post-card'));
            const order = items.map(item => item.dataset.id);
            callback('reorder', order);
        });
    };

    RENDER();

    return container;
}

//region copy to CB
function copyToClipboard(value, message) {
    const tempTextarea = document.createElement('textarea');
    tempTextarea.value = value;
    tempTextarea.setAttribute('readonly', '');
    tempTextarea.style.position = 'absolute';
    tempTextarea.style.left = '-9999px';

    document.body.appendChild(tempTextarea);

    tempTextarea.select();
    tempTextarea.setSelectionRange(0, tempTextarea.value.length);

    document.execCommand('copy');

    document.body.removeChild(tempTextarea);

    alert(`i/${message}`, 5000);
}

//region search
function search(alert) {
    const tagline = document.getElementById('taglist').value
    const tags = tagline.trim().split(/\s/).filter(val => val !== '');

    let query_page = `/search?tags=`

    tags.map(tag => {
        query_page += '+' + tag
    })

    if (alert) {
        query_page += `&alert=${alert.rslt}/${alert.msg}`
    }

    window.location.href = query_page
}

//region format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Б';
    const k = 1024;
    const sizes = ['B', 'Kb', 'Mb', 'Gb'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const size = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
    return `${size} ${sizes[i]}`;
}

//region cr tag line
function createTagline(tag) {
    const tagline = document.createElement('div');
    tagline.className = 'tagline';

    const linkElems = [];

    const plusElem = createAction('+', tagline, () => {
        document.getElementById('taglist').value += ' ' + tag.tag;
        search();
    });
    linkElems.push(plusElem);

    const minusElem = createAction('-', tagline, () => {
        document.getElementById('taglist').value += ' -' + tag.tag;
        search();
    });
    linkElems.push(minusElem);

    const tagElem = createAction(tag.tag, tagline, () => {
        document.getElementById('taglist').value = tag.tag;
        search();
    });
    linkElems.push(tagElem);

    const tagquantitty = document.createElement('div');
    tagline.appendChild(tagquantitty);
    tagquantitty.innerText = tag.count > 999 ? `${(tag.count / 1000).toFixed(1)}k` : tag.count;
    tagquantitty.className = 'tag-quantity';

    let originalColor = '#49e8fc';
    if (tag.group) {
        originalColor = tag.group.color;
    }

    const uniqueClass = 'S' + Authy.generateKey(10)

    const elemstyle = `
            .${uniqueClass} {
                color: ${originalColor};
                transition: all 0.2s;
            }
            .${uniqueClass}:hover {
                color: ${originalColor};
                filter: brightness(75%);
            }
        `;

    const style = document.createElement('style');
    tagline.appendChild(style);

    style.innerHTML = elemstyle

    linkElems.forEach((elem) => {
        elem.classList.add(uniqueClass);
    });
    return tagline
}

//region cr tag select
async function createTagSelector(tags, elem) {
    const taglist = await request('getTagList', { taglist: tags });
    const tagcol = elem
    tagcol.innerHTML = '';

    const groups = []

    //{name: '', priority:0, tags:[]}

    for (const tag of taglist) {
        if (tag.group) {
            if (!groups.find(val => val.name == tag.group.name)) {
                groups.push({ name: tag.group.name, priority: tag.group.priority, tags: [] })
            }
            const defaultGroupIndex = groups.findIndex(val => val.name == tag.group.name)
            groups[defaultGroupIndex].tags.push(tag)
        } else {
            if (!groups.find(val => val.name == Language.defaultTags)) {
                groups.push({ name: Language.defaultTags, priority: 0, tags: [] })
            }
            const defaultGroupIndex = groups.findIndex(val => val.name == Language.defaultTags)
            groups[defaultGroupIndex].tags.push(tag)
        }
    }

    groups.sort((a, b) => b.priority - a.priority)

    const tagblock = document.querySelector('.search-col .tags')

    for (const group of groups) {
        const groupelem = createDiv('tag-group', tagblock)

        const label = createDiv('label', groupelem)
        label.innerText = group.name

        for (const grTag of group.tags) {
            groupelem.appendChild(createTagline(grTag))
        }
    }
}

//region own verify
async function ownerVerify(uname) {
    const user = await request('getUserProfileData', { userKey });
    return user.data.login == uname;
}

//region adm verify
async function adminVerify() {
    const user = await request('getUserProfileData', { userKey });
    return user.data.acc_level > 1;
}

//region cr img load
function createImgLoadOverlay(parent) {
    const load_overlay = createDiv('loading-overlay', parent)

    const infContainer = createDiv('loading-overlay-info', parent)

    const loadLabel = createDiv('label', infContainer)
    loadLabel.innerHTML = Language.previewLoad
    const progressBarContainer = createDiv('progress-bar-cont', infContainer)
    const progressBar = createDiv('progress-bar', progressBarContainer)

    const imgCounter = createDiv('label', infContainer)

    const images = parent.querySelectorAll('img');
    let imagesLoaded = 0;

    function addLoadedAndCheck() {
        imagesLoaded++;
        checkImagesLoaded()
    }

    function checkImagesLoaded() {
        imgCounter.innerHTML = `${imagesLoaded} / ${images.length}`
        progressBar.style.width = `${imagesLoaded / images.length * 100}%`

        if (imagesLoaded === images.length) {
            load_overlay.classList.add('fade-out');
            infContainer.classList.add('fade-out');

            load_overlay.addEventListener('animationend', function () {
                load_overlay.remove();
            });
            infContainer.addEventListener('animationend', function () {
                infContainer.remove();
            });
        }
    }

    imgCounter.innerHTML = `0 / ${images.length}`

    images.forEach((img) => {
        if (img.complete) {
            addLoadedAndCheck();
        } else {
            img.addEventListener('load', addLoadedAndCheck);

            img.addEventListener('error', addLoadedAndCheck);
        }
    });

    checkImagesLoaded()
}

//region parse tmst
function parseTimestamp(timestamp) {
    let currentdate = new Date(Math.floor(timestamp));

    const padZero = (num) => num.toString().padStart(2, '0');

    let datetime = padZero(currentdate.getDate()) + "."
        + padZero(currentdate.getMonth() + 1) + "."
        + currentdate.getFullYear() + " "
        + padZero(currentdate.getHours()) + ":"
        + padZero(currentdate.getMinutes()) + ":"
        + padZero(currentdate.getSeconds());

    return datetime;
}

//region elem vis obs
function onElementFullyVisible(element, callback) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio === 1) {
                callback()
                observer.unobserve(element)
            }
        });
    }, {
        threshold: 0.9
    });

    observer.observe(element);
}

//region format user inp
function formatUserText(input) {
    let formattedText = input
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
        .replace(/\*(.*?)\*/g, '<i>$1</i>')
        .replace(/_(.*?)_/g, '<u>$1</u>')
        .replace(/\n/g, '<br>');
    return formattedText;
}