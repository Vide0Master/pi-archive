const urlParams = new URLSearchParams(window.location.search)
const urlTags = urlParams.get('tags');

const pageButtonsLimit = 6

document.querySelector('.search-row #taglist').placeholder = Language.defaultTags

//region Page links
async function update_pages(query, currentPage) {
    const page_count = await request(`getPageCount`, { query })

    const page_list_block = document.querySelector('.page-navigator')
    page_list_block.innerHTML = ''

    currentPage = parseInt(currentPage)

    const pageNcont = createDiv('pageNavCont', page_list_block)

    const pageSelCont = createDiv('pageSelCont', pageNcont)

    const first = createAction('<<', pageSelCont, () => {
        get_posts(1)
    })
    first.title = '1'
    const previous = createAction('<', pageSelCont, () => {
        get_posts(currentPage - 1)
    })
    first.title = currentPage - 1

    if (currentPage == 1) {
        first.classList.add('disabled')
        previous.classList.add('disabled')
    }

    const pageSelector = document.createElement('input')
    pageSelCont.appendChild(pageSelector)
    pageSelector.type = 'number'
    pageSelector.className = 'pageSelectorNumber'
    pageSelector.min = 1
    pageSelector.max = currentPage + pageButtonsLimit
    pageSelector.step = 1
    pageSelector.value = currentPage

    const pageIndicatorCont = createDiv('pageIndicatorCont', pageNcont)

    for (let i = currentPage - pageButtonsLimit; i <= currentPage + pageButtonsLimit; i++) {
        const pageDiv = createDiv('pageInd', pageIndicatorCont)
        const pageDivNumb = createDiv('pageN', pageDiv)
        pageDivNumb.innerHTML = i
        if (i == currentPage) {
            pageDiv.classList.add('current')
        } else if (i < 1 || i > page_count.pages) {
            pageDiv.classList.add('hidden')
            pageDivNumb.innerHTML = ''
        } else {
            pageDiv.addEventListener('click', () => {
                get_posts(i)
            })
        }
    }

    pageSelector.addEventListener('wheel', (event) => {
        event.preventDefault();
        const step = parseInt(pageSelector.getAttribute('step')) || 1;
        const currentValue = parseInt(pageSelector.value) || 0;

        if (event.deltaY < 0 && currentValue < page_count.pages) {
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
            get_posts(pageSelector.value)
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
            get_posts(pageSelector.value)
        }
    })

    const next = createAction('>', pageSelCont, () => {
        get_posts(currentPage + 1)
    })
    next.title = currentPage + 1
    const last = createAction('>>', pageSelCont, () => {
        get_posts(page_count.pages)
    })
    last.title = page_count.pages

    if (currentPage == page_count.pages) {
        next.classList.add('disabled')
        last.classList.add('disabled')
    }
}

//region P S T SF
function passSearchTagsToSearchField() {
    document.getElementById('taglist').value = new URLSearchParams(window.location.search).get('tags')
}

//region tags from url
function get_tags() {
    if (!urlTags) {
        return document.getElementById('taglist').value
    } else {
        return urlTags
    }
}

//region posts for page
async function get_posts(page) {
    const taglist = get_tags()
    await update_pages(taglist, page)

    const titleElm = document.querySelector('title')
    titleElm.innerHTML = `${Language.search.shortcut[0]}: ${Language.search.shortcut[1]} ${page}`
    const tags = taglist.trim().split(/\s/).filter(val => val !== '')
    if (tags.length > 0) titleElm.innerHTML += `, ${Language.search.shortcut[2]}: ${tags.join(', ')}`

    const post_list = await request('getPosts', {
        query: taglist,
        page
    })

    const posts_block = document.querySelector('.results')
    posts_block.innerHTML = ''

    let postIndex = 0

    while (postIndex < post_list.length) {
        const post = post_list[postIndex]

        let elm;
        switch (true) {
            case !!post.postGroupData: {
                post.postGroupData.group.forEach(id => {
                    const index = post_list.findIndex(obj => obj.id == id);
                    if (index !== -1) {
                        post_list.splice(index, 1);
                    }
                });
                elm = await createGroup(post.postGroupData)
            }; break;
            default: {
                elm = createPostCard(post)
                postIndex++
            }; break;
        }

        posts_block.appendChild(elm)
    }
}

passSearchTagsToSearchField()
get_posts(1)

//region Get glob tags
async function getGlobalTags(lim) {
    return await request('getTagsList', { tagcount: lim, userKey: localStorage.getItem('userKey') || sessionStorage.getItem('userKey') })
}

//region cr tag sel
async function createTagSelector() {
    const taglist = await getGlobalTags(100)

    const tagcol = document.querySelector('.tags')

    for (const tag of taglist) {
        tagcol.appendChild(createTagline(tag))
    }
}

createTagSelector()