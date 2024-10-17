async function processCollection(id) {
    console.log(id)

    const collectionInfo = (await request('controlGroup', { type: 'getGroupByID', id })).group

    console.log(collectionInfo)

    async function fetchPostData(id) {
        const pdata = await request('getPostData', { id });
        if (pdata.rslt != 's') {
            alert(`${pdata.rslt}/${pdata.msg}`, 5000)
        }
        return pdata.post;
    }

    const background = createDiv('comic-container', document.querySelector('.norma-page-container'))
    background.style.display = 'none'

    const page_counter = createDiv('page-counter', background)
    page_counter.innerHTML = `0 / ${collectionInfo.group.length + 1}`

    const closeComic = createDiv('close-comic', background)
    closeComic.innerHTML = 'Закрыть просмотр'
    closeComic.addEventListener('click', () => { closeOverlay() })

    const pages = []

    let currentpage = 0
    function displayComic(pg) {
        background.removeAttribute('style')
        document.querySelector('html').style.overflow = 'hidden'
        currentpage = pg
        switchPage()
    }
    function switchPage() {
        for (const elem of document.querySelectorAll('.pages-container *')) {
            elem.style.display = 'none'
        }
        const page = pages[currentpage]
        page.removeAttribute('style')
        page_counter.innerHTML = `${currentpage + 1} / ${collectionInfo.group.length}`
    }
    function nextPage() {
        if (currentpage < collectionInfo.group.length - 1) {
            currentpage++
            switchPage()
        }
    }
    function prevPage() {
        if (currentpage > 0) {
            currentpage--
            switchPage()
        }
    }
    function closeOverlay() {
        background.style.display = 'none'
        document.querySelector('html').removeAttribute('style')
    }

    const prevPageElem = createDiv('prev-page', background)
    prevPageElem.addEventListener('click', () => { prevPage() })
    const left_arrow = document.createElement('img')
    prevPageElem.appendChild(left_arrow)
    left_arrow.src = 'left-arrow.svg'

    const pages_container = createDiv('pages-container', background)
    for (const post of collectionInfo.group) {
        const page = document.createElement('img')
        pages_container.appendChild(page)
        page.src = `/file?userKey=${localStorage.getItem('userKey') || sessionStorage.getItem('userKey')}&id=${post}`
        page.style.display = 'none'
        page.id = 'ID' + post
        pages.push(page)
    }

    const nextPageElem = createDiv('next-page', background)
    nextPageElem.addEventListener('click', () => { nextPage() })
    const right_arrow = document.createElement('img')
    nextPageElem.appendChild(right_arrow)
    right_arrow.src = 'right-arrow.svg'

    document.addEventListener(
        "keyup",
        (event) => {
            if (background.style.display != 'none') {
                switch (event.code) {
                    case 'KeyA':
                    case 'ArrowLeft':
                        prevPage()
                        break;
                    case 'KeyD':
                    case 'ArrowRight':
                        nextPage()
                        break;
                    case 'Escape':
                        closeOverlay()
                        break;
                }
            }
        }
    );

    const tags = []
    const collectionContainer = createDiv('collection-container', document.querySelector('.content-container'))
    let counter = 1

    for (const post of collectionInfo.group) {
        const page_container = createDiv('col-page-container', collectionContainer)

        const CC = counter - 1
        page_container.addEventListener('click', () => {
            displayComic(CC)
        })

        const post_img = document.createElement('img')
        post_img.src = `/file?userKey=${localStorage.getItem('userKey') || sessionStorage.getItem('userKey')}&id=${post}`
        page_container.appendChild(post_img)

        const page_num_cont = createDiv('page-number-counter-container', page_container)

        const page_num = createDiv('page-number-counter', page_num_cont)
        page_num.innerHTML = counter++

        const view_from_page = createDiv('view-from-page', page_num_cont)
        view_from_page.innerHTML = 'Просмотреть с<br>этой страницы'

        const postData = await fetchPostData(post)
        for (const tag of postData.tags) {
            if (tags.indexOf(tag) < 0) {
                tags.push(tag)
            }
        }
    }



    createTagSelector(tags, document.querySelector('.tags'))

    async function setActions() {
        const actionCol = document.querySelector('.post-actions')

        if (await ownerVerify(collectionInfo.owner) || await adminVerify()) {
            createAction('Редактировать коллекцию', actionCol, () => {
                const container = createBlurOverlay()

                container.addEventListener('click', (e) => {
                    if (e.target === container) {
                        container.remove()
                    }
                })

                const reord_over = reorderOverlay(collectionInfo, true, true, async (result, data) => {
                    switch (result) {
                        case 'cancel': {
                            container.remove()
                        }; break;
                        case 'delete': {
                            if (confirm(`Вы уверены что хотите удалить коллекцию ID:${collectionInfo.id}|${collectionInfo.name}`)) {
                                const deleteResult = await request('controlGroup',
                                    {
                                        type: 'deleteGroup',
                                        groupID: collectionInfo.id
                                    })
                                if (deleteResult.rslt == 's') {
                                    container.remove()
                                    alert(`e/${deleteResult.msg}`)
                                } else {
                                    alert(`${deleteResult.rslt}/${deleteResult.msg}`, 5000)
                                }
                            }
                        }; break;
                        case 'reorder': {
                            const reorderResult = await request('controlGroup',
                                {
                                    type: 'reorderGroup',
                                    newOrder: data,
                                    groupID: collectionInfo.id
                                })
                            if (reorderResult.rslt == 's') {
                                container.remove()
                            }
                            alert(`${reorderResult.rslt}/${reorderResult.msg}`, 5000)
                        }; break;
                        case 'rename': {
                            container.remove()
                            const new_name = showPopup(title = 'Измените название коллекции', defaultText = collectionInfo.name)
                            new_name.then(async value => {
                                if (value) {
                                    const rename_result = await request('controlGroup',
                                        {
                                            type: 'renameGroup',
                                            groupID: collectionInfo.id,
                                            newName: value
                                        })
                                    alert(`${rename_result.rslt}/${rename_result.msg}`, 5000)
                                }
                            })
                        }; break;
                    }
                })
                container.appendChild(reord_over)
            })
            createAction(
                'Конвертировать коллекцию в группу',
                document.querySelector('.post-actions'),
                async () => {
                    if (confirm('Вы уверены что хотите конвертировать эту коллекцию в группу?')) {
                        const convResult = await request('controlGroup',
                            {
                                type: 'setGroupType',
                                newGroupType: 'group',
                                groupID: collectionInfo.group.id
                            })
                        alert(`${convResult.rslt}/${convResult.msg}`)
                    }
                }
            )
        }
    }
    await setActions()
}

const params = new URLSearchParams(window.location.search)
processCollection(params.get('id'))