const webSocket = new WebSocket(`ws://${window.location.host}`);

webSocket.addEventListener('open', () => {
    if (DEVMODE) {
        console.log(`WebSocket server(ws://${window.location.host}) connected`);
    }
    WSSend('CT')
});

if (DEVMODE) {
    webSocket.addEventListener('close', () => {
        console.log('WebSocket connection closed');
    });

    webSocket.addEventListener('error', (error) => {
        console.error('WebSocket error:', error);
    });
}

function WSListener(type, target, cb) {
    webSocket.addEventListener('message', (msg) => {
        const WSmsg = JSON.parse(msg.data)
        if (WSmsg.type == type && WSmsg.target == target) cb(WSmsg.data)
    })
}

function WSSend(type, data) {
    const request = {
        type,
        user: {
            key: localStorage.getItem('userKey') || sessionStorage.getItem('userKey'),
            type: 'WEB'
        },
        data
    }
    webSocket.send(JSON.stringify(request));
}

if (localStorage.getItem('userKey') || sessionStorage.getItem('userKey'))
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

//region tag autofill
async function addTagsAutofill(field, parent, preventSearch = false) {
    const autocomplete = createDiv('autocomplete', parent)
    autocomplete.style.display = 'none'
    let selector = []
    let selPos = -1

    function getCursorWordIndex(field) {
        const cursorPos = field.selectionStart;
        const value = field.value;
        const parts = value.split(' ');

        let startPos = 0;
        for (let i = 0; i < parts.length; i++) {
            const word = parts[i];
            if (cursorPos >= startPos && cursorPos <= startPos + word.length) {
                return i;
            }
            startPos += word.length + 1;
        }
        return -1;
    }

    async function process(e) {
        const parts = field.value.split(' ');
        const cursorWordIndex = getCursorWordIndex(field);
        const targetWord = parts[cursorWordIndex];

        let lastPart = targetWord;
        if (targetWord[0] == '-') {
            lastPart = lastPart.substring(1);
        }

        function setField() {
            parts[cursorWordIndex] = selector[selPos].tag;
            if (targetWord[0] == '-') {
                parts[cursorWordIndex] = "-" + parts[cursorWordIndex];
            }
            field.value = parts.join(' ');
            autocomplete.style.display = 'none';
            selPos = -1;
            selector = [];
        }

        if (e.code == "Enter") {
            if (selPos > -1) {
                setField()
                return
            } else {
                if (!preventSearch) {
                    search(field.value)
                }
            }
        }

        if (lastPart.length >= 2) {
            let rst = false
            switch (e.code) {
                case "ArrowUp": {
                    e.preventDefault()
                    if (selPos > 0) {
                        selPos -= 1
                    }
                    rst = true
                }; break;
                case "ArrowDown": {
                    e.preventDefault()
                    if (selPos < selector.length - 1) {
                        selPos += 1
                    }
                    rst = true
                }; break;
            }
            for (const elm of selector) {
                elm.elem.classList.remove('active')
            }
            if (selPos >= 0 && selPos < selector.length)
                selector[selPos].elem.classList.add('active')
            if (rst)
                return

            const listRslt = await request('getTagsAutocomplete', { tagPart: lastPart })
            if (listRslt.rslt == 'e') {
                alert(listRslt.rslt + "/" + listRslt.msg)
                return
            }
            if (listRslt.tags.length == 0) {
                autocomplete.style.display = 'none'
                autocomplete.innerHTML = ''
                return
            }

            selector = []
            selPos = -1
            autocomplete.removeAttribute('style')
            autocomplete.innerHTML = ''

            let i = 0
            for (const tag of listRslt.tags) {
                const tagContainer = createDiv('tagContainer', autocomplete)
                const tagElem = createTagline(tag, { s: false, tedit: false })
                tagContainer.appendChild(tagElem)
                selector.push({
                    tag: tag.tag,
                    elem: tagContainer
                })
                tagElem.addEventListener('mousedown', () => {

                    selPos = i++
                    setField()
                })
            }

        } else {
            autocomplete.style.display = 'none'
        }
    }

    field.addEventListener('keydown', (e) => {
        process(e)
    })
    field.addEventListener('click', (e) => {
        process(e)
    })
    field.addEventListener('focusout', () => {
        autocomplete.style.display = 'none'
    })
    field.addEventListener('focusin', () => {
        if (autocomplete.innerHTML != '') {
            autocomplete.removeAttribute('style')
        }
    })
}

function tryInsertSearchActions() {
    const sfield = document.querySelector('.search-row')
    if (sfield) {
        const taglist = sfield.querySelector('#taglist')
        taglist.setAttribute('autocomplete', 'off')
        const searchBtn = sfield.querySelector('#search-button')
        searchBtn.addEventListener('click', () => {
            search(taglist.value)
        })
        addTagsAutofill(taglist, sfield)
    }
}
tryInsertSearchActions()

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

    if (!postData) {
        return createDiv()
    }

    const postCardLang = Language.postCard

    const postCardContainer = createDiv('post-card-container')
    const postCard = createDiv('post-card', postCardContainer)

    if (!noClickReaction) {
        const lnkElem = document.createElement('a')
        postCard.appendChild(lnkElem)
        lnkElem.className = 'link'
        const sTags = new URLSearchParams(window.location.search).get('tags')
        lnkElem.href = `/view?id=${postData.id}${sTags ? `&tags=${sTags}` : ''}`
    }

    const postDataCont = createDiv('post-data-container', postCard)

    const postIdCont = createDiv('post-id-container', postDataCont)
    postIdCont.innerHTML = postData.id
    postIdCont.title = postCardLang.id

    const post_stats = postData.postRating
    const rating = post_stats.likes - post_stats.dislikes
    if (rating != 0) {
        const ratingCont = createDiv('inf-cont', postDataCont)
        const postScore = createDiv('rating', ratingCont)
        postScore.title = postCardLang.rating
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

    if (postData.commentCount > 0) {
        const commentCont = createDiv('inf-cont', postDataCont)
        const postCommentsCount = createDiv('comments-count', commentCont)
        postCommentsCount.innerHTML = postData.commentCount
        postCommentsCount.title = postCardLang.CC
    }

    if (postData.postRating.faved) {
        const favCont = createDiv('inf-cont', postDataCont)
        const fav = createDiv('fav')
        fav.title = postCardLang.fav
        favCont.prepend(fav)

        const favImg = document.createElement('img')
        fav.appendChild(favImg)
        favImg.src = 'fav.svg'
    }

    const imageContainer = createDiv('image-container', postCard)

    const previewImg = document.createElement('img')
    imageContainer.appendChild(previewImg)
    previewImg.src = `/file?userKey=${localStorage.getItem('userKey') || sessionStorage.getItem('userKey')}&id=${postData.id}&thumb=true`
    previewImg.className = 'preview-image'

    const warningContainerContainer = createDiv('warning-container-container', postDataCont)

    const warningContainer = createDiv('warning-container', warningContainerContainer)

    function timeSinceCreation(time) {
        const date1 = Date.now();
        const date2 = new Date(time);
        const differenceInMilliseconds = Math.abs(date2 - date1);
        const differenceInHours = differenceInMilliseconds / (1000 * 60 * 60);
        return differenceInHours;
    }

    if (timeSinceCreation(postData.timestamp) < 12) {
        const new_ribbon = createDiv('new-ribbon', warningContainer)
        new_ribbon.innerHTML = postCardLang.newPost
    }

    if (postData.tags.length < 5) {
        const low_tags = createDiv('low-tags-ribbon', warningContainer)
        if (postData.tags.length == 0) {
            low_tags.innerHTML = postCardLang.LTA[0]
        } else {
            low_tags.innerHTML = postCardLang.LTA[1]
        }
    }

    function getFileExtension(filename) {
        const parts = filename.split('.');
        return parts.length > 1 ? parts.pop() : '';
    }
    const fileExt = getFileExtension(postData.file)
    if (['mp4', 'mov', 'avi', 'mkv', 'gif'].includes(fileExt)) {
        const video_ind_cont = createDiv('video-warning', warningContainer)
        if (fileExt != 'gif') {
            video_ind_cont.innerHTML = '▶ ' + postCardLang.video
        } else {
            video_ind_cont.innerHTML = '▶ GIF'
        }
    }

    const defins = [
        { type: '4K<br>UHD', active: (postData.size.y >= 2160) },
        { type: '1440<br>QHD', active: (postData.size.y >= 1440) },
        { type: '1080<br>FHD', active: (postData.size.y >= 1080) },
        { type: '720<br>HD', active: (postData.size.y >= 720) }
    ]

    for (const res of defins) {
        if (res.active) {
            const hd_indicator_cont = createDiv('hd-indicator', imageContainer)
            const hdText = createDiv('text', hd_indicator_cont)
            hdText.innerHTML = res.type
            break
        }
    }

    return postCardContainer
}

try {
    setFooterText()
} catch { }


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

    createAction(footerLang.pathNotes, actions, async () => {
        const overlay = createBlurOverlay()
        overlay.addEventListener('click', (e) => {
            if (e.target == overlay) overlay.remove()
        })
        const versInfo = await request('getVersionInfo')
        const pInfo = await request('getPatchNotes')

        const vcont = createDiv('patchNotesContainer', overlay)
        const closeCont = createDiv('closeCont', vcont)
        const xSymb = document.createElement('img')
        closeCont.appendChild(xSymb)
        xSymb.src = 'x-mark.svg'
        closeCont.addEventListener('click', (e) => {
            overlay.remove()
        })

        const labelList = createDiv('label-list', vcont)
        for (const compName in versInfo) {
            const compLabel = createDiv('v-label', labelList)
            compLabel.innerHTML = compName + ' ' + versInfo[compName]
            compLabel.classList.add(compName)
        }

        const updateList = createDiv('update-list', vcont)
        for (const update of pInfo) {
            const updateContainer = createDiv('update-container', updateList)

            const versionsRow = createDiv('version-row', updateContainer)

            const updDate = createDiv('update-date', versionsRow)
            updDate.innerHTML = update.date

            for (const versionLabel in update.versions) {
                if (update.versions[versionLabel] != '') {
                    const versionContainer = createDiv('version-container', versionsRow)
                    if (update.versions[versionLabel] == versInfo[versionLabel]) {
                        const currentLabel = createDiv('current-label', versionContainer)
                        currentLabel.innerHTML = 'CURRENT'
                    }
                    const verValue = createDiv('v-label', versionContainer)
                    verValue.innerHTML = update.versions[versionLabel]
                    verValue.classList.add(versionLabel)
                }
            }

            const updatesCol = createDiv('updates-list', updateContainer)
            for (const upd of update.updates) {
                const lineContainer = createDiv('line-cont', updatesCol)

                const label = createDiv('line-label', lineContainer)

                const tagLine = createDiv('tag-line', label)
                if (upd.services && upd.services.length > 0) {
                    for (const service of upd.services) {
                        const servLabel = createDiv('v-label', tagLine)
                        servLabel.innerHTML = service
                        servLabel.classList.add(service)
                    }
                }

                if (upd.tag) {
                    const tag = createDiv('line-tag', tagLine)
                    tag.innerHTML = upd.tag.toUpperCase()
                    tag.classList.add(upd.tag)
                }

                label.innerHTML += upd.text


                if (upd.users && upd.users.length > 0) {
                    const appliesToCont = createDiv('applies-to-cont', lineContainer)
                    createDiv('intro', appliesToCont).innerHTML = 'For:'

                    for (const lvl of upd.users) {
                        createDiv(lvl, appliesToCont).innerHTML = capitalizeFirstLetter(lvl)
                    }
                }
            }
        }
    })

    createAction('R.I.P.', actions, () => {
        openRIP()
    })
    //createIndicator('g', sysLabel)

    // const sysHealthInfoContainer = createDiv('sys-health-container', footer)

    // const sysHealthSizer = createDiv('sys-health-sizer', sysHealthInfoContainer)
    // const sysLabelSizer = createDiv('', sysHealthSizer)
    // sysLabelSizer.innerHTML = footerLang.status.label

    // const sysHealth = createDiv('sys-healt-info', sysHealthInfoContainer)
    // const sysLabel = createDiv('', sysHealth)
    // sysLabel.innerHTML = footerLang.status.label

    // const elementCont = createDiv('elements-container', sysHealth)

    // const versions = createDiv('version-list', elementCont)
    // const verLabel = createDiv('vlabel', versions)
    // verLabel.innerHTML = footerLang.status.vLabel

    // async function getVers() {
    //     const versInfo = await request('getVersionInfo')
    //     for (const ver in versInfo) {
    //         const verBlock = createDiv('', versions)
    //         verBlock.innerHTML = `${ver}: ${versInfo[ver]}`
    //     }
    // }
    // getVers()

    // const systemRepots = createDiv('sysRepCont', elementCont)
    // const sysRepLabel = createDiv('label',systemRepots)
    // sysRepLabel.innerHTML = footerLang.status.systemReports
}

try {
    PInav()
} catch { }


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

//region cr switch
function createSwitch(name, parent, cb, checked = false) {
    const swLine = createDiv('switch-line', parent)
    createDiv('sw-label', swLine).innerHTML = name
    const sw = document.createElement('input')
    sw.type = 'checkbox'
    sw.checked = checked
    swLine.appendChild(sw)
    sw.addEventListener('change', () => cb(sw.checked))
    return swLine
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
    const countRslt = await request('controlUserDM', { type: 'getUserMessagesCount' })

    const messages_link = document.querySelector('.nav-row').querySelector('.messages')
    const counter = createDiv('counter', messages_link)

    async function updateState(count) {
        if (count.unread > 0 || count.requiredAction) {
            counter.removeAttribute('style')
            if (count.requiredAction) {
                counter.style.backgroundColor = '#a53030'
                counter.innerText = '!'
                counter.title = msgCountLang[0]
                return
            }

            if (count.unread > 0) {
                counter.innerText = count.unread
                counter.title = msgCountLang[1]
                for (const user in count.unreadPerUser) {
                    const userName = await getUserName(user)
                    counter.title += `\n${userName}: ${count.unreadPerUser[user]}`
                }
            }
        } else {
            counter.style.display = 'none'
        }
    }

    updateState(countRslt)

    WSListener('messageCountUpdate', '', (data) => {
        updateState(data.count)
    })
}

//region get username
async function getUserName(login) {
    const user = await request('getUserProfileData', { login })
    return user.data.username
}

//region Parse user
function parseUserLogin(login, elem, showCircle = true) {
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

        userDiv.title = capitalizeFirstLetter(Language.user_status_translation[user.data.status])
        elem.appendChild(userDiv)

        if (showCircle) {
            const status = createDiv('ACTstatus', elem)
            WSListener('userStatusUpdate', user.data.login, (data) => {
                status.classList.remove(...['online', 'afk', 'offline'])
                status.classList.add(data.state)
                status.title = Language.userActivityState[data.state]
            })
            WSSend('getUserActivity', { user: user.data.login })
        }
    })()
}

//region capitalaze
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

//region create group
function createGroup(groupData) {
    const tempCont = createDiv('temp-container')
    tempCont.style.display = 'none'

    async function process() {
        const post_list = await request('getPosts',
            {
                query: `id:${groupData.group.join(',')}`,
                page: 1,
                postsCount: 9999,
                grpOverride: true
            })

        const postCardList = []
        const outlines = []
        let lastCardUnopened

        function regOutlineTrigger(elem) {
            elem.addEventListener('mouseenter', () => {
                outlines.forEach(ln => {
                    ln.classList.add('active')
                })
            })
            elem.addEventListener('mouseleave', () => {
                outlines.forEach(ln => {
                    ln.classList.remove('active')
                })
            })
        }

        const groupControlCont = createDiv('group-element-container', tempCont)
        regOutlineTrigger(groupControlCont)
        groupControlCont.style.setProperty('--borderclr', groupData.color)
        const infoContainer = createDiv('group-info-container', groupControlCont)
        outlines.push(infoContainer)
        const groupNameLine = createDiv('group-name', infoContainer)
        groupNameLine.innerText = groupData.name

        if (post_list.length > 5) {
            const additinalCardsController = createDiv('additional-cards', infoContainer)
            additinalCardsController.innerText = `+${post_list.length - 5}`
            let isOpen = false
            additinalCardsController.addEventListener('click', () => {
                if (isOpen) {
                    postCardList.forEach((elm, i) => {
                        if (i >= 5) elm.style.display = 'none'
                    })
                    additinalCardsController.innerText = `+${postCardList.length - 5}`
                    lastCardUnopened.classList.add('group-last-border')
                } else {
                    postCardList.forEach((elm) => {
                        elm.style.display = ''
                    })
                    additinalCardsController.innerText = `-${postCardList.length - 5}`
                    lastCardUnopened.classList.remove('group-last-border')
                }
                isOpen = !isOpen
            })
        }

        if (groupData.type == 'collection') {
            const colview = createButton(Language.group.colView, infoContainer)
            colview.addEventListener('mousedown', (event) => {
                const sTags = new URLSearchParams(window.location.search).get('tags')
                const Link = `/collection?id=${groupData.id}${sTags ? `&tags=${sTags}` : ''}`
                if (event.button === 1)
                    event.preventDefault()
                if ((event.button === 0 && event.ctrlKey) || event.button === 1) {
                    window.open(Link, '_blank').focus();
                    return
                }
                window.location.href = Link
            })
        }

        post_list.forEach((postData, cardN) => {
            const postCard = createPostCard(postData)
            if (cardN == post_list.length - 1) {
                postCard.classList.add('group-last-border')
            }
            tempCont.appendChild(postCard)
            postCardList.push(postCard)
            postCard.style.setProperty('--borderclr', groupData.color)
            const outline = createDiv('group-outline')
            postCard.insertBefore(outline, Array.from(postCard.childNodes)[0])
            outlines.push(outline)
            regOutlineTrigger(postCard)
        })

        if (post_list.length > 5) {
            lastCardUnopened = postCardList[4]
            lastCardUnopened.classList.add('group-last-border')
        }

        postCardList.forEach((cont, i) => {
            if (i >= 5) cont.style.display = 'none'
        })

        let parent = tempCont
        Array.from(tempCont.children).forEach((child) => {
            parent.parentNode.insertBefore(child, parent.nextSibling);
            parent = child;
        })
    }
    process()

    return tempCont
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
        label.innerText = `"${group.name}" ID:${group.id}`;

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

        const pcardClass = '.post-card-container'

        reorderContainer.addEventListener('dragstart', (e) => {
            if (e.target.closest(pcardClass)) {
                draggedItem = e.target.closest(pcardClass);
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
            const target = e.target.closest(pcardClass);
            if (target && target !== draggedItem) {
                target.classList.add('over');
            }
        });

        reorderContainer.addEventListener('dragleave', (e) => {
            const target = e.target.closest(pcardClass);
            if (target && target !== draggedItem) {
                target.classList.remove('over');
            }
        });

        reorderContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            const target = e.target.closest(pcardClass);
            if (target && target !== draggedItem) {
                const allItems = Array.from(reorderContainer.querySelectorAll(pcardClass));
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
            const items = Array.from(reorderContainer.querySelectorAll(pcardClass));
            const order = items.map(item => item.dataset.id);
        }

        reorderContainer.addEventListener('click', (e) => {
            const target = e.target.closest(pcardClass);
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
            const target = e.target.closest(pcardClass);
            if (target && selectedItem && target !== selectedItem) {
                const allItems = Array.from(reorderContainer.querySelectorAll(pcardClass));
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
        delete_btn.addEventListener('click', (e) => {
            if (e.shiftKey) {
                callback('fullDelete')
            } else {
                callback('delete')
            }
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
            const items = Array.from(reorderContainer.querySelectorAll(pcardClass));
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
function search(taglist, alert) {
    const tags = taglist.trim().split(/\s/).filter(val => val !== '');

    let query_page = `/search?tags=`

    query_page += tags.join('+')

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
function createTagline(tag, params = { s: true, tedit: true }) {
    const tagline = document.createElement('div');
    tagline.className = 'tagline';

    const linkElems = [];

    let originalColor = '#49e8fc';
    if (tag.group) {
        originalColor = tag.group.color;
    }
    const searchElem = document.getElementById('taglist')
    if (params.tedit) {
        const plusElem = createAction('+', tagline, () => {
            const tagsList = searchElem.value.trim().split(/\s/).filter(val => val !== '')
            tagsList.push(tag.tag)
            searchElem.value = tagsList.join(' ')
            if (params.s)
                search(searchElem.value);
        });
        plusElem.style.color = originalColor
        linkElems.push(plusElem);
    }

    if (params.tedit) {
        const minusElem = createAction('-', tagline, () => {
            const tagsList = searchElem.value.trim().split(/\s/).filter(val => val !== '')
            tagsList.push("-" + tag.tag)
            searchElem.value = tagsList.join(' ')
            if (params.s)
                search(searchElem.value);
        });
        linkElems.push(minusElem);
        minusElem.style.color = originalColor
    }

    const tagElem = createAction(tag.tag, tagline, () => {
        if (params.tedit)
            searchElem.value = tag.tag;
        if (params.s)
            search(searchElem.value);
    });
    linkElems.push(tagElem);

    tagElem.style.color = originalColor

    if (tag.count > 0) {
        const tagquantitty = document.createElement('div');
        tagline.appendChild(tagquantitty);
        tagquantitty.innerText = tag.count > 999 ? `${(tag.count / 1000).toFixed(1)}k` : tag.count;
        tagquantitty.className = 'tag-quantity';
    }

    return tagline
}

//region cr tag select
async function createTagSelector(tags, elem) {
    const taglist = await request('getTagsList', { taglist: tags });
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

    const tagblock = tagcol

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

//region parse tmst
function parseTimestamp(timestamp) {
    timestamp = parseInt(timestamp)
    const now = new Date();
    const date = new Date(timestamp);

    const time = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    const fullDate = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;

    const isToday = now.toDateString() === date.toDateString();
    const isYesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString() === date.toDateString();

    if (isToday) {
        return `${Language.timestamps.today}, ${time}`;
    } else if (isYesterday) {
        return `${Language.timestamps.yesterday}, ${time}`;
    } else if (date.getFullYear() === now.getFullYear()) {
        return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')} ${time}`;
    } else {
        return `${fullDate}`;
    }
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

//region popinp
function showPopupInput(title = 'Title', defaultText = '', cb) {
    const blurryBackground = createBlurOverlay()

    const popup = document.createElement('div')
    popup.className = 'popup'

    const popupTitle = document.createElement('h2')
    popupTitle.textContent = title

    const textarea = document.createElement('textarea')
    textarea.value = defaultText

    const btn_row = createDiv('button_row')

    const btnD = createButton(Language.popup.cancel)
    btn_row.appendChild(btnD)
    const btnC = createButton(Language.popup.accept)
    btn_row.appendChild(btnC)

    btnC.addEventListener('click', () => {
        closePopup()
        const text = textarea.value
        if (text != defaultText) {
            cb(text)
        } else {
            cb(false)
        }
    })

    btnD.addEventListener('click', () => {
        closePopup()
        cb(false)
    })

    popup.appendChild(popupTitle)
    const txtCont = createDiv('textarea-container', popup)
    txtCont.appendChild(textarea)
    popup.appendChild(btn_row)
    blurryBackground.appendChild(popup)

    function closePopup() {
        document.body.removeChild(blurryBackground)
    }

    blurryBackground.addEventListener('click', (event) => {
        if (event.target === blurryBackground) {
            closePopup()
            cb(false)
        }
    });

    textarea.focus()
    document.body.classList.add('blurred')

    return { txtArea: textarea, txtAreaCont: txtCont }
}

//region themes
const colorSchemesList = [
    { name: 'default', value: 'default' },
    { name: 'dark', value: 'dark' },
    { name: 'egypt', value: 'egypt' },
    { name: 'nature', value: 'nature' },
    { name: 'pony', value: 'pony' }
]

function setTheme() {
    const theme = localStorage.getItem('theme')
    if (!theme) {
        localStorage.setItem('theme', 'default')
        setTheme()
        return
    }

    const link = document.getElementById("theme-style");

    if (link) {
        link.href = `themes/${theme}.css`;
    } else {
        const newLink = document.createElement("link");
        newLink.rel = "stylesheet";
        newLink.id = "theme-style";
        newLink.href = `themes/${theme}.css`;
        document.head.appendChild(newLink);
    }
}

setTheme()

//region create avatar element
function createUserAvatarElem(postID, parent, isLinkToPost) {
    if (postID) {
        const avatar_block = createDiv('avatar-elem')
        if (parent) parent.appendChild(avatar_block)

        async function processAvatar() {
            const avatarPostData = await request('getPostData', { id: postID })
            if (avatarPostData.rslt == 's') {
                let avatar
                switch (true) {
                    case ['.jpg', '.jpeg', '.png', '.webp', '.gif'].some(end => avatarPostData.post.file.endsWith(end)): {
                        avatar = document.createElement('img')
                        avatar_block.appendChild(avatar)
                        avatar.src = `/file?userKey=${localStorage.getItem('userKey') || sessionStorage.getItem('userKey')}&id=${postID}${avatarPostData.post.file.endsWith('.gif') ? '' : "&thumb=true"}`
                    }; break;
                    case ['.mp4', '.mov', '.avi', '.mkv'].some(end => avatarPostData.post.file.endsWith(end)): {
                        avatar = document.createElement('video');
                        avatar.controls = false;
                        avatar.autoplay = true;
                        avatar.loop = true;
                        avatar.volume = 0
                        avatar.alt = 'video preview';
                        avatar.src = `/file?userKey=${localStorage.getItem('userKey') || sessionStorage.getItem('userKey')}&id=${postID}`
                        avatar.addEventListener('timeupdate', () => {
                            if (video.currentTime > 30) {
                                video.currentTime = 0;
                            }
                        });
                        avatar_block.appendChild(avatar)
                    }; break;
                    default: return
                }
                if (isLinkToPost) {
                    avatar.setAttribute('onclick', `window.location.href='/view?id=${postID}'`)
                    avatar.style.cursor = 'pointer'
                }
                avatar.title = `${profileLang.userData.avatarPost} ${postID}`
                avatar_block.appendChild(avatar)
            }
        }
        processAvatar()
        return avatar_block
    }
}

//region snowflakes
function createChristmasSnowflakes() {
    const snowflakesContainer = createDiv('snowflakes', document.querySelector('.norma-page-container'));

    function getDeviceType() {
        const userAgent = navigator.userAgent;

        if (/Mobi|Android/i.test(userAgent)) {
            return 'Mobile';
        } else if (/Tablet|iPad/i.test(userAgent)) {
            return 'Tablet';
        } else {
            return 'Desktop';
        }
    }

    let count = 0
    switch (getDeviceType()) {
        case 'Mobile': {
            count = 30
        }; break;
        case 'Tablet': {
            count = 50
        }; break;
        case 'Desktop': {
            count = 70
        }; break;
    }

    for (let i = 0; i < count; i++) {
        const snowflake = createDiv('snowflake', snowflakesContainer);
        snowflake.innerHTML = '❄';

        function animateSnowflake() {
            const randPos = Math.random() * 100;
            const randTime = Math.random() * 10 + 20;

            let vars = ''
            vars += `--pos-x: ${randPos}%; `
            for (let i = 0; i <= 10; i++) {
                vars += `--pos-x-${i}: ${Math.random() * 1000 - 500}%; `
            }

            vars += `animation: snowFall ${randTime}s linear forwards; animation-delay: ${Math.random() * 15}s; `
            const colorGrad = Math.random() * 100 + 155
            vars += `color: rgb(${colorGrad}, ${colorGrad}, 255); `
            vars += `--SF-size: ${Math.random() * 100 + 80}%; `
            snowflake.setAttribute('style', vars);

            snowflake.addEventListener('animationend', () => {
                snowflake.removeAttribute('style');
                animateSnowflake();
            });
        }
        animateSnowflake();
    }
}


if ([11, 0, 1].includes(new Date().getMonth())) {
    createChristmasSnowflakes();
}

//region RIP
function openRIP() {
    const overlay = createBlurOverlay()
    overlay.addEventListener('click', (e) => {
        if (e.target == overlay) overlay.remove()
    })
    const ripCont = createDiv('rip-cont', overlay)

    const ripTitle = createDiv('rip-title', ripCont)
    ripTitle.innerHTML = 'Rest in peace...'

    const list = [
        { date: 2024, name: "Кіт Пузирь" }
    ]

    for (const item of list) {
        const itemCont = createDiv('rip-line', ripCont)
        itemCont.innerHTML = `${item.date} - ${item.name}`
    }
}