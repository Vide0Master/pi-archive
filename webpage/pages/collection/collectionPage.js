const collectionLang = Language.collection

const postInfoCont = document.querySelector('.post-info')
postInfoCont.querySelector('.label').innerHTML = collectionLang.postInfoLabel
document.querySelector('.post-actions .label').innerHTML = collectionLang.postActionsLabel
document.querySelector('.search-row #taglist').placeholder = Language.defaultTags

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

    background.addEventListener('click', (e) => {
        if (e.target == background)
            closeOverlay()
    })

    const pages = []

    let currentpage = 1
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
        const page = pages[currentpage - 1]
        page.removeAttribute('style')
        update_pages(currentpage)
    }
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
    function closeOverlay() {
        background.style.display = 'none'
        document.querySelector('html').removeAttribute('style')
    }

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
        page.src = `/file?userKey=${localStorage.getItem('userKey') || sessionStorage.getItem('userKey')}&id=${post}`
        page.style.display = 'none'
        page.id = 'ID' + post
        pages.push(page)
    }

    const nextPageElem = createDiv('next-page', background)
    nextPageElem.addEventListener('click', (e) => { nextPage(e) })
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

    for (const post of collectionInfo.group) {
        const page_container = createDiv('col-page-container', collectionContainer)

        const CC = counter
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
        view_from_page.innerHTML = collectionLang.viewFrom

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
                            if (confirm(`${collectionLang.actions.editColl.delete} "${collectionInfo.name}"`)) {
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
                            showPopupInput(collectionLang.actions.editColl.rename, collectionInfo.name, async (value) => {
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
            createAction(
                collectionLang.actions.toGroup.btn,
                document.querySelector('.post-actions'),
                async () => {
                    if (confirm(`${collectionLang.actions.toGroup.btn} "${collectionInfo.name}"`)) {
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


//region P S T SF
function passSearchTagsToSearchField() {
    document.getElementById('taglist').value = new URLSearchParams(window.location.search).get('tags')
}

passSearchTagsToSearchField()