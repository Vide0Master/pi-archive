
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
    if (isActiveUser) showSessionControl()
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
        parseUserLogin(login, welcomeMessageContainer, false)
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

    createUserAvatarElem(userData.data.usersettings.ProfileAvatarPostID, container, true)

    if (userData.data.usersettings.ProfileBackgroundPostID) {
        const imgContainer = createDiv('imgContainer')
        const img = document.createElement('img')
        imgContainer.appendChild(img)
        img.className = 'backgroundImg'
        img.src = `/file?userKey=${localStorage.getItem('userKey') || sessionStorage.getItem('userKey')}&id=${userData.data.usersettings.ProfileBackgroundPostID}`
        document.querySelector('main').insertBefore(imgContainer, document.querySelector('.user-page-container'))
    }

    const status = createDiv('status', container)
    WSListener('userStatusUpdate', userData.data.login, (data) => {
        status.innerHTML = Language.userActivityState[data.state]
    })
    WSSend('getUserActivity', { user: userData.data.login })

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
                    parseUserLogin(userData.data.login, ln, false)
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
async function showActions(userData, activeUser) {
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
            }))

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
            })
        )

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
        })

        // region set avatar
        createAction(profileLang.actions.resetAvatar, container, async () => {
            const rslt = await request('controlUserSettings', { type: 'update', update: { ProfileAvatarPostID: null } })
            alert(rslt.msg, 5000)
            if (rslt.rslt == 's') {
                window.location.href = window.location.href
            }
        })

        // region set background
        createAction(profileLang.actions.resetProfileBackground, container, async () => {
            const rslt = await request('controlUserSettings', { type: 'update', update: { ProfileBackgroundPostID: null } })
            alert(rslt.msg, 5000)
            if (rslt.rslt == 's') {
                window.location.href = window.location.href
            }
        })

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
            themelist[i].name = profileLang.actions.theme.themes[themelist[i].value]
        }
        container.appendChild(
            createSelect(themelist, profileLang.actions.theme.sel + `: ${profileLang.actions.theme.themes[localStorage.getItem('theme')]}`, async (sel) => {
                request('controlUserSettings', { type: 'update', update: { theme: sel } })
                localStorage.setItem('theme', sel)
                setTheme()
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
    const user_card_block = document.querySelector('.user-card')
    const container = createDiv('list-container', user_card_block)

    container.style.display = 'none'

    const label = createDiv('label', container)
    label.innerText = "Experiment features"

    let keySequence = [];
    const targetSequence = ["F1", "F4", "F8", "F8"];

    function onSequenceMatch() {
        container.removeAttribute('style')
        container.classList.add('experiments')
    }

    document.addEventListener("keydown", (event) => {
        if (!event.shiftKey) {
            keySequence = [];
            return;
        }

        const key = event.key;
        keySequence.push(key);

        const currentSequence = keySequence.join(",");
        const targetStart = targetSequence.slice(0, keySequence.length).join(",");

        if (currentSequence === targetSequence.join(",")) {
            onSequenceMatch();
            keySequence = [];
        } else if (currentSequence !== targetStart) {
            keySequence = [];
        }
    });

    document.addEventListener("keyup", (event) => {
        if (event.key === "Shift") {
            keySequence = [];
        }
    });


    const expreimentsFuncs = [
        { name: "Realtime chats", key: "realtimeChats" }
    ]

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

    if (expreimentsFuncs.length == 0) {
        const noexp = createDiv('', container)
        noexp.innerHTML = 'No experiments in test'
    }
}

//region sessions

async function showSessionControl() {
    const sessionLang = Language.profile.sessions
    const user_card_block = document.querySelector('.user-card')
    const container = createDiv('list-container', user_card_block)
    const label = createDiv('label', container)
    label.innerHTML = sessionLang.label
    const sessionRslt = await request('getUserSessionList')

    const currentKey = localStorage.getItem('userKey') || sessionStorage.getItem('userKey')

    for (const session of sessionRslt.sessions.sort((a, b) => b.tslac - a.tslac)) {
        const sessionCard = createDiv('session-card', container)

        if (session.key == currentKey) {
            sessionCard.classList.add('current')
            createDiv('current-session', sessionCard).innerHTML = sessionLang.current
        }

        if (session.type == 'TGBOT') {
            sessionCard.classList.add('TG')
        }

        const sessionType = createDiv('session-type', sessionCard)
        sessionType.innerHTML = sessionLang.type + ": " + session.type

        const sessionDate = createDiv('last-activity', sessionCard)
        sessionDate.innerHTML = sessionLang.lastActive + ': ' + parseTimestamp(session.tslac)

        const actionBar = createDiv('action-bar', sessionCard)
        const revokeBtn = createButton(sessionLang.revoke, actionBar)
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
}