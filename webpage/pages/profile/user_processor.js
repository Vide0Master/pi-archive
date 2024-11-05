
const profileLang = Language.profile
//region init
async function init() {

    const search = new URLSearchParams(window.location.search)
    const user_login = search.get('user')

    const user_data = await request('getUserProfileData', { userKey: localStorage.getItem('userKey') || sessionStorage.getItem('userKey'), login: user_login })

    processPage(user_data, !user_login)
}

init()

//region process page
async function processPage(userData, isActiveUser) {
    let activeUser;
    if (isActiveUser) {
        activeUser = userData
    } else {
        activeUser = await request('getUserProfileData', { userKey: localStorage.getItem('userKey') || sessionStorage.getItem('userKey') })
    }

    if (userData.rslt == 'e') {
        alert('w/' + userData.msg, 0)
    } else {
        showWelcomeText(userData.data.login, userData.isOwner)
        showUserData(userData)
        showActions(userData, activeUser)
    }
    if (userData.data.favs.length > 0) getFavs(userData.data.favs, !isActiveUser)
}

//region welcome txt
async function showWelcomeText(login, isOwner) {
    const container = document.querySelector('.user-page-container')

    const welcomeMessageContainer = container.querySelector('.welcome_message_block')

    const hello = createDiv("hello")
    welcomeMessageContainer.appendChild(hello)
    const welcome_text = Language.welcome_messages[Math.floor(Math.random() * Language.welcome_messages.length)]
    hello.innerHTML = welcome_text.text
    hello.setAttribute('title', welcome_text.lang)

    welcomeMessageContainer.innerHTML += `, `
    if (isOwner) {
        parseUserLogin(login, welcomeMessageContainer)
    } else {
        welcomeMessageContainer.innerHTML += profileLang.visitor
    }
}

//region user data
function showUserData(userData) {
    const user_card_block = document.querySelector('.user-card')

    const container = createDiv('list-container')
    user_card_block.appendChild(container)

    if (!userData.isOwner) {
        const label = createDiv('label')
        container.appendChild(label)
        label.innerText = `${profileLang.userData.label[0]} ${userData.data.login}`
    }

    if (userData.data.usersettings.ProfileAvatarPostID) {
        const avatar_block = createDiv('avatar-block')
        container.appendChild(avatar_block)

        const avatar = document.createElement('img')
        avatar_block.appendChild(avatar)
        avatar.src = `/file?userKey=${localStorage.getItem('userKey') || sessionStorage.getItem('userKey')}&id=${userData.data.usersettings.ProfileAvatarPostID}&thumb=true`
        avatar.setAttribute('onclick', `window.location.href='/view?id=${userData.data.usersettings.ProfileAvatarPostID}'`)
        avatar.title = `${profileLang.userData.avatarPost} ${userData.data.usersettings.ProfileAvatarPostID}`
    }

    if (userData.data.usersettings.ProfileBackgroundPostID) {
        const imgContainer = createDiv('imgContainer')
        const img = document.createElement('img')
        imgContainer.appendChild(img)
        img.className = 'backgroundImg'
        img.src = `/file?userKey=${localStorage.getItem('userKey') || sessionStorage.getItem('userKey')}&id=${userData.data.usersettings.ProfileBackgroundPostID}`
        document.querySelector('main').insertBefore(imgContainer, document.querySelector('.user-page-container'))
    }

    const usr_data_list = {
        username: `${profileLang.userData.username}: `,
        login: `${profileLang.userData.login}: `,
        creationdate: `${profileLang.userData.creationdate}: `,
        postsCount: `${profileLang.userData.postsCount}: `
    }


    for (const line in usr_data_list) {
        const ln = createDiv('data-line')
        container.appendChild(ln)
        switch (line) {
            case 'username': {
                if (!userData.isOwner) {
                    ln.innerHTML = usr_data_list[line]
                    parseUserLogin(userData.data.login, ln)
                } else {
                    ln.remove()
                }
            }; break;
            case 'login': {
                if (userData.isOwner) {
                    ln.innerHTML = usr_data_list[line] + userData.data[line]
                } else {
                    ln.remove()
                }
            }; break;
            case 'creationdate': {
                ln.innerHTML = usr_data_list[line] + parseTimestamp(userData.data[line])
            }; break;
            case 'postsCount': {
                ln.innerHTML = usr_data_list[line]
                const act = createAction(userData.data[line], ln, () => {
                    window.location.href = `/search?tags=author:${userData.data.login}`
                })
                act.title = profileLang.userData.viewUserPosts
            }; break;
            default: {
                ln.innerHTML = usr_data_list[line] + userData.data[line]
            }; break;
        }
    }
}

//region actions
function showActions(userData, activeUser) {
    const user_card_block = document.querySelector('.user-card')

    const container = createDiv('list-container')
    user_card_block.appendChild(container)

    const label = createDiv('label')
    container.appendChild(label)
    label.innerText = profileLang.actions.label

    //region owner
    if (userData.isOwner) {

        //region unlog
        createAction(profileLang.actions.unlogin, container, () => Authy.unlogin())

        //region ch username
        createAction(profileLang.actions.changeUserName.btn, container, async () => {
            const new_name = prompt(profileLang.actions.changeUserName.conf, userData.data.username)
            if (new_name) {
                const rslt = await request('changeUserName', { userKey: localStorage.getItem('userKey') || sessionStorage.getItem('userKey'), newName: new_name })

                if (rslt.rslt == 's') {
                    window.location.href = `/profile?alert=${rslt.rslt}/${rslt.msg.split(' ').join('+')}/5000`
                } else {
                    alert(rslt.rslt + '/' + rslt.msg, 5000)
                }
            }
        })

        //region ch pass
        createAction(profileLang.actions.changePass.btn, container, async () => {
            const new_pasas = prompt(profileLang.actions.changePass.conf)
            if (new_pasas) {
                const rslt = await request('changeUserPassword', { userKey: localStorage.getItem('userKey') || sessionStorage.getItem('userKey'), newPassword: CryptoJS.SHA256(new_pasas).toString() })
                alert(rslt.rslt + '/' + rslt.msg, 5000)
            }
        })

        //region ch blklist
        createAction(profileLang.actions.changeBl.btn, container, async () => {
            const blacklist = activeUser.data.blacklist.join('\n')

            const new_blacklist = await showPopup(profileLang.actions.changeBl.label, blacklist)
            if (blacklist != new_blacklist) {
                const result = await request('updateBlacklist', {
                    userKey: localStorage.getItem('userKey') || sessionStorage.getItem('userKey'),
                    blacklist: new_blacklist.split(/\s+|\n+|\,/).filter(val => val !== '')
                })
                alert(result.msg)
            }
        })

        // region set avatar
        createAction(profileLang.actions.resetAvatar, container, async () => {
            const rslt = await request('controlUserSettings', { type: 'update', update: { ProfileAvatarPostID: null } })
            alert(rslt.msg, 5000)
        })

        // region set background
        createAction(profileLang.actions.resetProfileBackground, container, async () => {
            const rslt = await request('controlUserSettings', { type: 'update', update: { ProfileBackgroundPostID: null } })
            alert(rslt.msg, 5000)
        })
    } else {
        //region wr msg
        createAction(profileLang.actions.sendDM.btn, container, async () => {
            const message_data = await showPopup(profileLang.actions.sendDM.label)
            if (message_data) {
                const message_result = await request('sendMessage', {
                    message: message_data,
                    from: activeUser.data.login,
                    to: userData.data.login,
                    msgtype: 'DM'
                })
                if (message_result.rslt == 's')
                    alert(`s/${profileLang.actions.sendDM.s}`, 5000)
                else
                    alert(message_result.msg, 5000)
            }
        })
        if (activeUser.data.acc_level > 1) {

        } else {

        }
    }
}

async function getFavs(favs, isActiveUser) {
    const favs_container = createDiv('favs-container', document.querySelector('.user-page-container'))

    const fav_label = createDiv('label', favs_container)
    fav_label.innerHTML = profileLang.favs.label

    if (isActiveUser) fav_label.innerHTML += ` ${profileLang.favs.ofUser}`


    const favs_zone = createDiv('favs-zone', favs_container)

    for (const favID of favs) {
        const pcard = createPostCard((await request('getPostData', { id: favID })).post)
        favs_zone.appendChild(pcard)
    }
}