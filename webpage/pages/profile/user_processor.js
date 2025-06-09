
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
    document.querySelector('title').innerHTML = userData.data.username

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
    if (isActiveUser) addHiddenExperiments()
}

//region welcome txt
async function showWelcomeText(login, isOwner) {
    const container = document.querySelector('.user-page-container')
    const welcomeMessageContainer = createDiv('welcome-message-block', container)

    const hello = createDiv("hello")
    welcomeMessageContainer.appendChild(hello)
    const welcome_text = Language.welcome_messages[Math.floor(Math.random() * Language.welcome_messages.length)]
    hello.innerHTML = welcome_text.text
    hello.setAttribute('title', welcome_text.lang)

    welcomeMessageContainer.innerHTML += `, `
    if (isOwner) {
        createUserName(login, welcomeMessageContainer, { link: false, popup: false, status: true })
    } else {
        welcomeMessageContainer.innerHTML += profileLang.visitor
    }
}

//region user data
function showUserData(userData) {
    if (userData.data.usersettings.ProfileBackgroundPostID) {
        const imgContainer = createDiv('imgContainer')
        const img = document.createElement('img')
        imgContainer.appendChild(img)
        img.className = 'backgroundImg'
        img.src = `/file?userKey=${localStorage.getItem('userKey') || sessionStorage.getItem('userKey')}&id=${userData.data.usersettings.ProfileBackgroundPostID}`
        document.querySelector('main').insertBefore(imgContainer, document.querySelector('.user-page-container'))
    }

    const contentContainer = document.querySelector('.user-page-container')
    const user_card_block = createDiv('user-card', contentContainer)

    if (userData.data.usersettings.ProfileAvatarPostID) {
        const userAvatarContainer = createDiv('user-avatar-container', user_card_block)
        const userAvatarWrapper = createDiv('user-avatar-wrapper', userAvatarContainer)
        createUserAvatarElem(userData.data.usersettings.ProfileAvatarPostID, userAvatarWrapper, true, 500)
    }

    if (!userData.isOwner) {
        const nickNameContainer = createDiv('user-nickname-container', user_card_block)
        createUserName(userData.data.login, nickNameContainer, { link: false, popup: false, status: true })
    }



    // const status = createDiv('status', container)
    // WSListener('userStatusUpdate', userData.data.login, (data) => {
    //     status.innerHTML = Language.userActivityState[data.state]
    // })
    // WSSend('getUserActivity', { user: userData.data.login })

    const usr_data_list = {
        login: `${profileLang.userData.login}: `,
        creationdate: `${profileLang.userData.creationdate}: `,
        postsCount: `${profileLang.userData.postsCount}: `
    }

    const userInfoRow = createDiv('user-info-row', user_card_block)

    const container = createDiv('list-container', userInfoRow)

    for (const line in usr_data_list) {
        const ln = createDiv('data-line')
        container.appendChild(ln)
        switch (line) {
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
                const act = createAction(userData.data[line], ln)
                act.href = `/search?tags=author:${userData.data.login}`
                act.title = profileLang.userData.viewUserPosts
            }; break;
            default: {
                ln.innerHTML = usr_data_list[line] + userData.data[line]
            }; break;
        }
    }
}

//region actions
async function showActions(userData, activeUser) {
    const userInfoRow = document.querySelector('.user-info-row')

    const container = createDiv('list-container', userInfoRow)

    const label = createDiv('label')
    container.appendChild(label)
    label.innerText = profileLang.actions.label

    //region owner
    if (userData.isOwner) {

        //region unlog
        createAction(profileLang.actions.unlogin, container, () => Authy.unlogin(), 'icons/user.svg')

        //region ch username
        createAction(profileLang.actions.changeUserName.btn, container,
            () => new Notify(profileLang.actions.changeUserName.conf, null, '#0ff', 'inputShort', async (newName) => {
                if (newName) {
                    const rslt = await request('changeUserName', { newName: newName })

                    if (rslt.rslt == 's') {
                        window.location.href = `/profile?alert=${rslt.rslt}/${rslt.msg.split(' ').join('+')}/5000`
                    } else {
                        alert(rslt.rslt + '/' + rslt.msg, 5000)
                    }
                }
            }), 'icons/edit.svg')

        //region ch pass
        createAction(profileLang.actions.changePass.btn, container,
            () => new Notify(profileLang.actions.changePass.conf, null, '#0ff', 'inputPass', (newPass) => {
                if (newPass) {
                    new Notify(profileLang.actions.changePass.confS, null, '#0ff', 'inputPass', async (newPassConf) => {
                        if (newPass != newPassConf) {
                            new Notify(profileLang.actions.changePass.passNotMatched, 5000, '#f00')
                        } else {
                            const rslt = await request('changeUserPassword', { newPassword: CryptoJS.SHA256(newPassConf).toString() })
                            alert(rslt.rslt + '/' + rslt.msg, 5000)
                        }
                    })
                }
            }), 'icons/edit.svg')

        //region ch blklist
        createAction(profileLang.actions.changeBl.btn, container, async () => {
            const blacklist = activeUser.data.blacklist.join('\n')
            const notf = new Notify(profileLang.actions.changeBl.label, null, '#000', 'inputLong', async (result) => {
                if (blacklist != result) {
                    const result = await request('updateBlacklist', {
                        userKey: localStorage.getItem('userKey') || sessionStorage.getItem('userKey'),
                        blacklist: result.split(/\s+|\n+|\,/).filter(val => val !== '')
                    })
                    alert(result.msg)
                }
            }, { value: blacklist })
        }, 'icons/delete-file.svg')

        // region set avatar
        createAction(profileLang.actions.resetAvatar, container, async () => {
            const rslt = await request('controlUserSettings', { type: 'update', update: { ProfileAvatarPostID: null } })
            alert(rslt.msg, 5000)
            if (rslt.rslt == 's') {
                window.location.href = window.location.href
            }
        }, 'icons/image-square.svg')

        // region set background
        createAction(profileLang.actions.resetProfileBackground, container, async () => {
            const rslt = await request('controlUserSettings', { type: 'update', update: { ProfileBackgroundPostID: null } })
            alert(rslt.msg, 5000)
            if (rslt.rslt == 's') {
                window.location.href = window.location.href
            }
        }, 'icons/image-rectangle.svg')

        //region show intro
        createSwitch(profileLang.actions.showIntro, container, (state) => {
            localStorage.setItem('showIntro', state)
        }, localStorage.getItem('showIntro') == 'true', 'icons/video-play.svg')

        //region set PPP
        const postsPerPages = [
            { name: 25, value: 25 },
            { name: 50, value: 50 },
            { name: 100, value: 100 },
            { name: 150, value: 150 },
            { name: 200, value: 200 },
        ]

        container.appendChild(
            createSelect(postsPerPages, profileLang.actions.PPP + `: ${userData.data.usersettings.posts_per_page || 50}`, async (sel) => {
                const rslt = await request('controlUserSettings', { type: 'update', update: { posts_per_page: sel } })
                alert(rslt.msg, 5000)
            })
        )

        //region set lang
        const langResult = await request('getLangsList')
        const langlist = []
        for (const lng of langResult.langs) {
            langlist.push({ name: lng.name, value: lng.id })
        }
        container.appendChild(
            createSelect(langlist, profileLang.actions.lang.sel + `: ${langlist.find(v => v.value == localStorage.getItem('lang')).name}`, async (sel) => {
                await request('controlUserSettings', { type: 'update', update: { lang: sel } })
                localStorage.setItem('lang', sel)
                window.location.href = window.location.href
            })
        )

        //region set theme
        let themelist = []
        themelist = themelist.concat(colorSchemesList)
        for (const i in themelist) {
            themelist[i].name = profileLang.actions.theme.themes[themelist[i].value] || themelist[i].value
        }
        container.appendChild(
            createSelect(themelist, profileLang.actions.theme.sel + `: ${profileLang.actions.theme.themes[localStorage.getItem('theme')] || profileLang.actions.theme.themes.custom}`, async (sel) => {
                if (sel == 'custom') {
                    const notfCont = new Notify('', '', 'var(--color3)', 'custom')

                    const colorTable = [
                        { name: profileLang.actions.theme.editor.colors['color1'], value: '--color1' },
                        { name: profileLang.actions.theme.editor.colors['color2'], value: '--color2' },
                        { name: profileLang.actions.theme.editor.colors['color3'], value: '--color3' },
                        { name: profileLang.actions.theme.editor.colors['font-color1'], value: '--font-color1' },
                        { name: profileLang.actions.theme.editor.colors['font-color2'], value: '--font-color2' },
                        { name: profileLang.actions.theme.editor.colors['font-color3'], value: '--font-color3' },
                        { name: profileLang.actions.theme.editor.colors['font-hover'], value: '--font-hover' },
                        { name: profileLang.actions.theme.editor.colors['interact-passive'], value: '--interact-passive' },
                        { name: profileLang.actions.theme.editor.colors['interact-active'], value: '--interact-active' },
                        { name: profileLang.actions.theme.editor.colors['interact-focus'], value: '--interact-focus' },
                    ]

                    const elemsContainer = createDiv('alert-theme-editor', notfCont.notificationElem)

                    const headLabel = createDiv('label', elemsContainer)
                    headLabel.innerText = profileLang.actions.theme.editor.label

                    const colorsList = createDiv('custom-theme-container', elemsContainer)

                    const currentStyles = getComputedStyle(document.documentElement);

                    let customStyleElem = document.getElementById('custom-style-elem')
                    if (!customStyleElem) {
                        customStyleElem = document.createElement('style')
                        customStyleElem.id = 'custom-style-elem'
                        const link = document.getElementById("theme-style")
                        link.insertAdjacentElement('afterend', customStyleElem)
                    }

                    function updateCustomStyles() {
                        customStyleElem.innerText = ':root{'
                        for (const color of colorTable) {
                            customStyleElem.innerText += `${color.value}: ${color.elem.value};`
                        }
                        customStyleElem.innerText += '}'
                    }

                    for (const colorID in colorTable) {
                        const color = colorTable[colorID]
                        const listElem = createDiv('colorListElem', colorsList)

                        const label = createDiv('label', listElem)
                        label.innerText = color.name

                        const colorSelector = document.createElement('input')
                        colorSelector.type = 'color'
                        listElem.appendChild(colorSelector)

                        colorSelector.value = currentStyles.getPropertyValue(color.value)

                        colorTable[colorID].elem = colorSelector

                        colorSelector.addEventListener('input', updateCustomStyles)
                    }

                    const controlField = createDiv('button-row', elemsContainer)

                    const reject = createDiv('cancel-button', controlField)
                    reject.innerText = '✖'
                    reject.addEventListener('click', () => {
                        notfCont.remove()
                        customStyleElem.remove()
                    })

                    const accept = createDiv('confirm-button', controlField)
                    accept.innerText = '✔'
                    accept.addEventListener('click', () => {
                        const stylesMap = {}
                        for (const color of colorTable) {
                            stylesMap[color.value] = color.elem.value
                        }
                        request('controlUserSettings', { type: 'update', update: { theme: JSON.stringify(stylesMap) } })
                        localStorage.setItem('theme', JSON.stringify(stylesMap))
                        notfCont.remove()
                    })

                } else {
                    request('controlUserSettings', { type: 'update', update: { theme: sel } })
                    localStorage.setItem('theme', sel)
                    setTheme()
                }
            })
        )

        container.appendChild(
            createSelect(
                [
                    { name: Language.view.fit.fits.normal + '(700px)', value: 'normal' },
                    { name: Language.view.fit.fits.horizontal, value: 'horizontal' },
                    { name: Language.view.fit.fits.vertical, value: 'vertical' }
                ],
                Language.view.fit.userSetsLabel, (result) => localStorage.setItem('imageFit', result)))

        //region sessions
        createAction(Language.profile.sessions.label, container, async () => {
            const notification = new Notify('', '', 'var(--color3)', 'custom')

            const notfWindow = createDiv('sessions-container', notification.notificationElem)

            const labelRow = createDiv('label-row', notfWindow)

            const sessionLang = Language.profile.sessions
            const label = createDiv('label', labelRow)
            label.innerHTML = sessionLang.label

            const complete = createDiv('confirm-button', labelRow)
            complete.innerHTML = '✔'
            complete.addEventListener('click', notification.remove)

            const sessionRslt = await request('getUserSessionList')

            const currentKey = localStorage.getItem('userKey') || sessionStorage.getItem('userKey')

            for (const session of sessionRslt.sessions.sort((a, b) => b.tslac - a.tslac)) {
                const sessionCard = createDiv('session-card', notfWindow)

                if (session.key == currentKey) {
                    sessionCard.classList.add('current')
                    sessionCard.title = sessionLang.current
                }

                if (session.type == 'TGBOT') {
                    sessionCard.classList.add('TG')
                }

                const sessionType = createDiv('session-type', sessionCard)
                switch (session.type) {
                    case 'TGBOT': sessionType.style = '--session-type-img:' + `url(icons/TGBotClient.svg)`; break;
                    case 'WEB': sessionType.style = '--session-type-img:' + `url(icons/BrowserClient.svg)`; break;
                }
                sessionType.title = session.key

                const sessionDate = createDiv('last-activity', sessionCard)
                sessionDate.innerHTML = parseTimestamp(session.tslac)

                const actionBar = createDiv('action-bar', sessionCard)
                const revokeBtn = createDiv('cancel-button', actionBar)
                revokeBtn.classList.add('cancel-button')
                revokeBtn.innerHTML = '✖'
                revokeBtn.title = sessionLang.revoke
                revokeBtn.addEventListener('click', async () => {
                    const rslt = await request('sessionController', {
                        type: 'removeSession',
                        stype: session.type,
                        skey: session.key
                    })
                    if (rslt.rslt == 's') {
                        alert(`s/${sessionLang.revokeSucc}`, 3000)
                        sessionCard.remove()
                    } else {
                        alert(rslt.rslt + "/" + rslt.msg)
                    }
                })
            }
        }, 'icons/session-list.svg')
    } else {
        //region wr msg
        createAction(profileLang.actions.sendDM.btn, container, async () => {
            new Notify(profileLang.actions.sendDM.label, null, '#092', 'inputLong', async (result) => {
                if (result) {
                    const message_result = await request('sendMessage', {
                        message: result,
                        from: activeUser.data.login,
                        to: userData.data.login,
                        msgtype: 'DM'
                    })
                    if (message_result.rslt != 's')
                        alert("e/" + message_result.msg, 5000)
                }
            }, { value: `${userData.data.username}!` })
        })
        if (activeUser.data.acc_level > 1) {

        } else {

        }
    }
}

//region FAVS
async function getFavs(favs, isActiveUser) {
    if (favs.length == 0) {
        return
    }
    const favs_container = createDiv('favs-container', document.querySelector('.user-page-container'))

    const fav_label = createDiv('label', favs_container)
    fav_label.innerHTML = profileLang.favs.label

    if (isActiveUser) fav_label.innerHTML += ` ${profileLang.favs.ofUser}`

    const favs_zone = createDiv('favs-zone', favs_container)

    const favsList = await request('getPosts',
        {
            query: `id:${favs.join(',')}`,
            page: 1,
            postsCount: 9999
        })
    for (const favID of favsList) {
        favs_zone.appendChild(createPostCard(favID))
    }
}

//region experiments
function addHiddenExperiments() {
    const container = createDiv('list-container', document.querySelector('.user-info-row'))
    container.classList.add('experiments')

    const label = createDiv('label', container)
    label.innerText = "Experiment features"

    const expreimentsFuncs = [
        { name: "Old post card resolution sticker", key: "oldPostSizesIndicator" },
        { name: "Inverted header bar", key: "invertHeaderBar" },
        { name: "Inverted header list", key: "invertHeaderList" },
        { name: "Splitted header bar", key: "splitHeaderBar" },
    ]

    if (expreimentsFuncs.length == 0) {
        container.remove()
        return
    }

    for (const func of expreimentsFuncs) {
        const expName = 'EXPERIMENT_' + func.key
        createSwitch(func.name, container, (state) => {
            const curr = localStorage.getItem(expName)
            if (!curr) {
                localStorage.setItem(expName, state)
            } else if (!state && curr) {
                localStorage.removeItem(expName)
            }

        }, localStorage.getItem(expName))
    }
}