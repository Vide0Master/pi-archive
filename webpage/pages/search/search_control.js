const urlParams = new URLSearchParams(window.location.search)
const urlTags = urlParams.get('tags');

//region Page links
async function update_pages(tags, blacklist) {
    const page_count = await request(`getPageCount`, { tags, blacklist })

    const page_list_block = document.querySelector('.page-navigator')
    page_list_block.innerHTML = ''
    for (let i = 1; i <= page_count.pages; i++) {
        const pg = document.createElement('a')
        pg.href = '#header'
        pg.innerText = i
        pg.addEventListener('click', () => get_posts(i))
        page_list_block.appendChild(pg)
    }
}

//region tags from url
function get_tags() {
    const taglist = {
        tags: [],
        blacklist: []
    }
    if (!urlTags) {
        return taglist
    }
    const tags = urlTags.trim().split(/\s/).filter(val => val !== '');

    let tagline = document.getElementById('taglist')
    for (const tag of tags) {
        tagline.value += tag + ' '
        if (tag.startsWith("-")) {
            taglist.blacklist.push(tag.slice(1))
        } else {
            taglist.tags.push(tag)
        }
    }
    return taglist
}

//region posts for page
async function get_posts(page) {
    const taglist = get_tags()
    await update_pages(taglist.tags, taglist.blacklist)

    const post_list = await request('getPosts',
        {
            tags: taglist.tags,
            blacklist: taglist.blacklist,
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

                switch (post.postGroupData.type) {
                    case 'collection': {
                        elm = createCollection(post.postGroupData)
                    }; break;
                    case 'group': {
                        elm = createGroup(post.postGroupData)
                    }; break;
                }
            }; break;
            default: {
                elm = createPostCard(post)
                postIndex++
            }; break;
        }

        posts_block.appendChild(elm)
    }

    createImgLoadOverlay(posts_block)
}

document.getElementById('search-button')
    .addEventListener('click', () => {
        search()
    })

document.getElementById('taglist')
    .addEventListener('keyup', (e) => {
        if (e.key == 'Enter') {
            search()
        }
    })

get_posts(1)

//region Get glob tags
async function getGlobalTags(lim) {
    return await request('getTagList', { tagcount: lim, userKey: localStorage.getItem('userKey') || sessionStorage.getItem('userKey') })
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