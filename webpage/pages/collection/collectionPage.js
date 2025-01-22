const collectionLang = Language.collection

const postInfoCont = document.querySelector('.post-info')
postInfoCont.querySelector('.label').innerHTML = collectionLang.postInfoLabel
document.querySelector('.post-actions .label').innerHTML = collectionLang.postActionsLabel
document.querySelector('.search-row #taglist').placeholder = Language.defaultTags

//region process collection
async function processCollection(id) {
    const collectionInfo = (await request('controlGroup', { type: 'getGroupByID', id })).group

    const postDataTemplate = {
        name: collectionLang.data.name,
        id: collectionLang.data.id,
        owner: collectionLang.data.owner
    }

    for (const line in postDataTemplate) {
        const lname = postDataTemplate[line]
        const lval = collectionInfo[line]
        switch (line) {
            case "owner": {
                const lineElem = createDiv('', postInfoCont)
                lineElem.innerHTML = `${lname}: `
                const act = createAction('', lineElem, () => {
                    window.location.href = `/profile?user=${line_val}`
                })
                parseUserLogin(lval, act)
            }; break;
            default: {
                const lineElem = createDiv('', postInfoCont)
                lineElem.innerHTML = `${lname}: ${lval}`
            }
        }
    }

    document.querySelector('title').innerHTML = collectionInfo.name

    const background = createDiv('comic-container', document.querySelector('.norma-page-container'))
    background.style.display = 'none'

    const page_counter = createDiv('page-counter', background)

    background.addEventListener('click', (e) => {
        if (e.target == background)
            closeOverlay()
    })

    const pages = []

    let currentpage = 1

    //region comic navigation
    function displayComic(pg) {
        background.removeAttribute('style')
        document.querySelector('html').style.overflow = 'hidden'
        currentpage = pg
        switchPage()
    }

    //region switch page
    function switchPage() {
        for (const elem of document.querySelectorAll('.pages-container *')) {
            elem.style.display = 'none'
        }
        const page = pages[currentpage - 1]
        page.removeAttribute('style')
        update_pages(currentpage)
    }

    //region next page
    function nextPage(event) {
        if (event.shiftKey) {
            currentpage = collectionInfo.group.length
            switchPage()
        } else {
            if (currentpage < collectionInfo.group.length) {
                currentpage++
                switchPage()
            }
        }
    }

    //region previous page
    function prevPage(event) {
        if (event.shiftKey) {
            currentpage = 1
            switchPage()
        } else {
            if (currentpage > 1) {
                currentpage--
                switchPage()
            }
        }
    }

    //region close overlay
    function closeOverlay() {
        background.style.display = 'none'
        document.querySelector('html').removeAttribute('style')
    }

    //region update pages
    async function update_pages(currentPage) {
        const pageButtonsLimit = 6

        const page_count = collectionInfo.group.length

        const page_list_block = page_counter
        page_list_block.innerHTML = ''

        currentPage = parseInt(currentPage)

        const pageNcont = createDiv('pageNavCont', page_list_block)

        const pageIndicatorCont = createDiv('pageIndicatorCont', pageNcont)
        for (let i = currentPage - pageButtonsLimit; i <= currentPage + pageButtonsLimit; i++) {
            const pageDiv = createDiv('pageInd', pageIndicatorCont)
            const pageDivNumb = createDiv('pageN', pageDiv)
            pageDivNumb.innerHTML = i
            if (i == currentPage) {
                pageDiv.classList.add('current')
            } else if (i < 1 || i > page_count) {
                pageDiv.classList.add('hidden')
                pageDivNumb.innerHTML = ''
            } else {
                pageDiv.addEventListener('click', () => {
                    currentpage = i
                    switchPage()
                })
            }
        }

        const pageSelector = document.createElement('input')
        pageNcont.appendChild(pageSelector)
        pageSelector.type = 'number'
        pageSelector.className = 'pageSelectorNumber'
        pageSelector.min = 1
        pageSelector.max = currentPage + pageButtonsLimit
        pageSelector.step = 1
        pageSelector.value = currentPage

        pageSelector.addEventListener('wheel', (event) => {
            event.preventDefault();
            const step = parseInt(pageSelector.getAttribute('step')) || 1;
            const currentValue = parseInt(pageSelector.value) || 0;

            if (event.deltaY < 0 && currentValue < page_count) {
                pageSelector.value = currentValue + step;
            } else if (event.deltaY > 0 && currentValue > 1) {
                pageSelector.value = currentValue - step;
            }

            const pageindicators = pageIndicatorCont.querySelectorAll('.pageInd')
            pageindicators.forEach((ind, i) => {
                ind.classList.remove('switch')
                if (i - pageButtonsLimit + currentPage == pageSelector.value && pageSelector.value != currentPage) {
                    ind.classList.add('switch')
                }
            })
        });

        pageSelector.addEventListener('mouseleave', () => {
            if (pageSelector.value != currentPage) {
                currentpage = pageSelector.value
                switchPage()
            }
        })

        pageSelector.addEventListener('change', () => {
            if (pageSelector.value > page_count.pages) {
                pageSelector.value = page_count.pages
            }
            if (pageSelector.value < 1) {
                pageSelector.value = 1
            }
            if (pageSelector.value != currentPage) {
                currentpage = pageSelector.value
                switchPage()
            }
        })
    }

    const prevPageElem = createDiv('prev-page', background)
    prevPageElem.addEventListener('click', (e) => { prevPage(e) })
    const left_arrow = document.createElement('img')
    prevPageElem.appendChild(left_arrow)
    left_arrow.src = 'left-arrow.svg'

    const pages_container = createDiv('pages-container', background)
    for (const post of collectionInfo.group) {
        const page = document.createElement('img')
        pages_container.appendChild(page)
        page.src = `/file?userKey=${localStorage.getItem('userKey') || sessionStorage.getItem('userKey')}&id=${post}${localStorage.getItem('fitCollectionPages') ? `&h=${screen.height}` : ''}`
        page.style.display = 'none'
        page.id = 'ID' + post
        pages.push(page)
    }

    const nextPageElem = createDiv('next-page', background)
    nextPageElem.addEventListener('click', (e) => { nextPage(e) })
    const right_arrow = document.createElement('img')
    nextPageElem.appendChild(right_arrow)
    right_arrow.src = 'right-arrow.svg'

    //region key navigation
    document.addEventListener(
        "keyup",
        (event) => {
            if (background.style.display != 'none') {
                switch (event.code) {
                    case 'KeyA':
                    case 'ArrowLeft':
                        prevPage(event)
                        break;
                    case 'KeyD':
                    case 'ArrowRight':
                        nextPage(event)
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


    const post_list = await request('getPosts',
        {
            query: `id:${collectionInfo.group.join(',')}`,
            page: 1,
            postsCount: 9999,
            grpOverride: true
        })

    for (const post of post_list) {
        const page_container = createDiv('col-page-container', collectionContainer)

        const CC = counter
        page_container.addEventListener('click', () => {
            displayComic(CC)
        })

        const post_img = document.createElement('img')
        post_img.src = `/file?userKey=${localStorage.getItem('userKey') || sessionStorage.getItem('userKey')}&id=${post.id}&h=300`
        page_container.appendChild(post_img)

        const page_num_cont = createDiv('page-number-counter-container', page_container)

        const page_num = createDiv('page-number-counter', page_num_cont)
        page_num.innerHTML = counter++

        const view_from_page = createDiv('view-from-page', page_num_cont)
        view_from_page.innerHTML = collectionLang.viewFrom

        for (const tag of post.tags) {
            if (tags.indexOf(tag) < 0) {
                tags.push(tag)
            }
        }
    }

    createTagSelector(tags, document.querySelector('.tags'))

    async function updateTagsList() {
        const post_list = await request('getPosts',
            {
                query: `id:${collectionInfo.group.join(',')}`,
                page: 1,
                postsCount: 9999,
                grpOverride: true
            })

        const tags = []

        for (const post of post_list) {
            for (const tag of post.tags) {
                if (tags.indexOf(tag) < 0) {
                    tags.push(tag)
                }
            }
        }

        createTagSelector(tags, document.querySelector('.tags'))
    }

    async function setActions() {
        const actionCol = document.querySelector('.post-actions')

        createSwitch(Language.collection.actions.fitToScreen, document.querySelector('.post-actions'), (state) => {
            localStorage.setItem('fitCollectionPages', true)
            const pages = Array.from(document.querySelector('.pages-container').childNodes)
            for (const page of pages) {
                const link = new URL(page.src)
                link.searchParams.delete('h')
                if (state) {
                    link.searchParams.append('h', screen.height)
                    page.src = link.href
                } else {
                    page.src = link.href
                    localStorage.removeItem('fitCollectionPages')
                }
            }
        }, localStorage.getItem('fitCollectionPages'))

        if (await ownerVerify(collectionInfo.owner) || await adminVerify()) {

            //region edit collection
            createAction(collectionLang.actions.editColl.btn, actionCol, () => {
                const container = createBlurOverlay()

                container.addEventListener('click', (e) => {
                    if (e.target === container) {
                        container.remove()
                    }
                })

                const reord_over = reorderOverlay(collectionInfo, async (result, data) => {
                    switch (result) {
                        case 'cancel': {
                            container.remove()
                        }; break;
                        case 'delete': {
                            new Notify(`${collectionLang.actions.editColl.delete.grp} "${collectionInfo.name}"`, null, '#f00', 'inputConfirm', async (result) => {
                                if (result) {
                                    const deleteResult = await request('controlGroup',
                                        {
                                            type: 'deleteGroup',
                                            groupID: collectionInfo.id
                                        })
                                    if (deleteResult.rslt == 's') {
                                        container.remove()
                                        alert(`s/${collectionLang.actions.editColl.delete.grps}`)
                                    } else {
                                        alert(`${deleteResult.rslt}/${deleteResult.msg}`, 5000)
                                    }
                                }
                            })
                        }; break;
                        case 'fullDelete': {
                            new Notify(`${collectionLang.actions.editColl.delete.psts} "${collectionInfo.name}"`, null, '#f00', 'inputConfirm', async (result) => {
                                if (result) {
                                    for (const post of collectionInfo.group) {
                                        const rslt = await request('deletePost', { post: post });
                                        if (rslt.rslt == 'e') alert(rslt.rslt + '/' + rslt.msg)
                                    }
                                    const deleteResult = await request('controlGroup', {
                                        type: 'deleteGroup',
                                        groupID: collectionInfo.id
                                    })

                                    if (deleteResult.rslt == 'e') alert(`${deleteResult.rslt}/${deleteResult.msg}`)

                                    if (deleteResult.rslt == 's') {
                                        container.remove()
                                        alert(`s/${collectionLang.actions.editColl.delete.pstss}`)
                                    }
                                }
                            })
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
                            new Notify(collectionLang.actions.editColl.rename, null, '#0ff', 'inputShort', async (value) => {
                                if (value) {
                                    const rename_result = await request('controlGroup',
                                        {
                                            type: 'renameGroup',
                                            groupID: collectionInfo.id,
                                            newName: value
                                        })
                                    alert(`${rename_result.rslt}/${rename_result.msg}`, 5000)
                                }
                            }, { value: collectionInfo.name })
                        }; break;
                        case 'color': {
                            const color_result = await request('controlGroup',
                                {
                                    type: 'setGroupColor',
                                    groupID: collectionInfo.id,
                                    newColor: data
                                })
                            alert(`${color_result.rslt}/${color_result.msg}`, 5000)
                        }; break;
                    }
                })
                container.appendChild(reord_over)
            })

            //region add to group
            createAction(
                collectionLang.actions.toGroup.btn,
                document.querySelector('.post-actions'),
                async () => {
                    new Notify(`${collectionLang.actions.toGroup.btn} "${collectionInfo.name}"`, null, '#f00', 'inputConfirm', async (result) => {
                        if (result) {
                            const convResult = await request('controlGroup',
                                {
                                    type: 'setGroupType',
                                    newGroupType: 'group',
                                    groupID: collectionInfo.group.id
                                })
                            alert(`${convResult.rslt}/${convResult.msg}`)
                        }
                    })
                }
            )

            //region add tags
            createAction(collectionLang.actions.tags.add.btn, actionCol, async () => {
                const notf = new Notify(collectionLang.actions.tags.add.label, null, '#0f0', 'inputLong', async (taglist) => {
                    if (taglist) {
                        const new_tags = taglist.split(/\s+|\n+/).filter(val => val !== '');

                        const alertBlock = new Notify('', null, '#0f0', 'custom')

                        const postContainer = createDiv('posts-update-container', alertBlock.notificationElem)

                        const postLabels = createDiv('post-labels-cont', postContainer)

                        const progressContainer = createDiv('progress-container', postContainer)
                        const progressLabel = createDiv('progress-label', progressContainer)
                        const progressBarContainer = createDiv('progress-bar-container', progressContainer)
                        const progressBar = createDiv('progress-bar', progressBarContainer)

                        progressLabel.innerHTML = `${collectionLang.actions.tags.completed}: 0 / ${collectionInfo.group.length}`

                        let counter = 0
                        function updateCounter() {
                            counter++
                            progressLabel.innerHTML = `${collectionLang.actions.tags.completed}: ${counter} / ${collectionInfo.group.length}`
                            progressBar.style.width = `${(counter / collectionInfo.group.length) * 100}%`
                            if (counter == collectionInfo.group.length) {
                                updateTagsList()
                                alertBlock.initTimer(5000)
                            }
                        }

                        async function setPostUpdate(id) {
                            const postElem = createDiv('post', postLabels)
                            postElem.innerHTML = id

                            postElem.classList.add('waiting')
                            postElem.title = collectionLang.actions.tags.processing
                            const post_data = await request('getPostData', { id });

                            if (post_data.rslt == 'e') {
                                postElem.classList.add('error')
                                return
                            }

                            postElem.title = collectionLang.actions.tags.add.adding

                            const rslt = await request('updateTags', {
                                post: id,
                                newTags: post_data.post.tags.concat(new_tags.filter(tag => !post_data.post.tags.includes(tag)))
                            });

                            if (rslt.rslt == 's') {
                                postElem.title = collectionLang.actions.tags.add.added
                                postElem.classList.add('success')
                            } else {
                                postElem.title = collectionLang.actions.tags.add.error
                                postElem.classList.add('error')
                            }
                            updateCounter()
                        }

                        for (const post of collectionInfo.group) {
                            setPostUpdate(post)
                        }
                    }
                })
                addTagsAutofill(notf.inputField, notf.textInputContainer, true)
            })

            //region remove tags
            createAction(collectionLang.actions.tags.remove.btn, actionCol, async () => {
                const notf = new Notify(collectionLang.actions.tags.remove.label, null, '#f00', 'inputLong', async (taglist) => {
                    if (taglist) {
                        const new_tags = taglist.split(/\s+|\n+/).filter(val => val !== '');

                        const alertBlock = new Notify('', null, '#f00', 'custom')

                        const postContainer = createDiv('posts-update-container', alertBlock.notificationElem)

                        const postLabels = createDiv('post-labels-cont', postContainer)

                        const progressContainer = createDiv('progress-container', postContainer)
                        const progressLabel = createDiv('progress-label', progressContainer)
                        const progressBarContainer = createDiv('progress-bar-container', progressContainer)
                        const progressBar = createDiv('progress-bar', progressBarContainer)

                        progressLabel.innerHTML = `${collectionLang.actions.tags.completed}: 0 / ${collectionInfo.group.length}`

                        let counter = 0
                        function updateCounter() {
                            counter++
                            progressLabel.innerHTML = `${collectionLang.actions.tags.completed}: ${counter} / ${collectionInfo.group.length}`
                            progressBar.style.width = `${(counter / collectionInfo.group.length) * 100}%`
                            if (counter == collectionInfo.group.length) {
                                updateTagsList()
                                alertBlock.initTimer(5000)
                            }
                        }

                        async function setPostUpdate(id) {
                            const postElem = createDiv('post', postLabels)
                            postElem.innerHTML = id

                            postElem.classList.add('waiting')
                            postElem.title = collectionLang.actions.tags.processing
                            const post_data = await request('getPostData', { id });

                            if (post_data.rslt == 'e') {
                                postElem.classList.add('error')
                                return
                            }

                            postElem.title = collectionLang.actions.tags.remove.removing

                            const post_tags = post_data.post.tags.filter(tag => !new_tags.includes(tag))

                            const rslt = await request('updateTags', { post: id, newTags: post_tags });

                            if (rslt.rslt == 's') {
                                postElem.title = collectionLang.actions.tags.remove.removed
                                postElem.classList.add('success')
                            } else {
                                postElem.title = collectionLang.actions.tags.remove.error
                                postElem.classList.add('error')
                            }
                            updateCounter()
                        }

                        for (const post of collectionInfo.group) {
                            setPostUpdate(post)
                        }
                    }
                })
                addTagsAutofill(notf.inputField, notf.textInputContainer, true)
            })
        }
    }
    await setActions()
}

//region show collections
async function showCollections() {
    const collectionsElem = createDiv('collections-list', document.querySelector('main'))

    const collectionsList = await request('controlGroup', { type: 'getAllCollections' })

    for (const collection of collectionsList.collections) {
        const collectionCont = createDiv('collection-cont', collectionsElem)
        collectionCont.setAttribute('style', '--border-color: ' + collection.color)

        const colImg = document.createElement('img')
        collectionCont.appendChild(colImg)
        colImg.src = `/file?userKey=${localStorage.getItem('userKey') || sessionStorage.getItem('userKey')}&id=${collection.group[0]}&h=350`

        const collectionName = createDiv('collection-name', collectionCont)
        collectionName.innerHTML = collection.name

        collectionCont.addEventListener('click', () => {
            window.location.href = `/collection?id=${collection.id}`
        })
    }
}

//region P S T SF
function passSearchTagsToSearchField() {
    document.getElementById('taglist').value = new URLSearchParams(window.location.search).get('tags')
}

const params = new URLSearchParams(window.location.search)
const collId = params.get('id')
if (collId != null) {
    processCollection(collId)
    passSearchTagsToSearchField()
} else {
    document.querySelector('.content-container').remove()
    showCollections()
}
