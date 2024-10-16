
//region init
(async () => {
    const search = new URLSearchParams(window.location.search)
    const user_login = search.get('user')

    const user_data = await request('getUserProfileData', { userKey: localStorage.getItem('userKey') || sessionStorage.getItem('userKey'), login: user_login })

    processPage(user_data, !user_login)
})()

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
    if (activeUser.isOwner) {
        if (activeUser.data.favs.length > 0) getFavs(activeUser.data.favs)
    }
}

//region welcome txt
async function showWelcomeText(login, isOwner) {
    const container = document.querySelector('.user-page-container')

    const welcomeMessageContainer = container.querySelector('.welcome_message_block')

    const hello = createDiv("hello")
    welcomeMessageContainer.appendChild(hello)
    const welcome_text = await request('getWelcomeText')
    hello.innerHTML = welcome_text.welcomeText.text
    hello.setAttribute('title', welcome_text.welcomeText.lang)

    welcomeMessageContainer.innerHTML += `, `
    if (isOwner) {
        parseUserLogin(login, welcomeMessageContainer)
    } else {
        welcomeMessageContainer.innerHTML += `посетитель`
    }
}

//region user data
function showUserData(userData) {
    const user_card_block = document.querySelector('.user-card')

    const container = createDiv('list-container')
    user_card_block.appendChild(container)

    const label = createDiv('label')
    container.appendChild(label)

    if (!userData.isOwner) {
        label.innerText = `Данные пользователя ${userData.data.login}`
    } else {
        label.innerText = 'Ваши данные'
    }

    if (userData.data.avatarpostid != '') {
        const avatar_block = createDiv('avatar-block')
        container.appendChild(avatar_block)

        const avatar = document.createElement('img')
        avatar_block.appendChild(avatar)
        avatar.src = `/file?userKey=${localStorage.getItem('userKey') || sessionStorage.getItem('userKey')}&id=${userData.data.avatarpostid}&thumb=true`
        avatar.setAttribute('onclick', `window.location.href='/view?id=${userData.data.avatarpostid}'`)
        avatar.title = `Нажмите что-бы открыть пост ${userData.data.avatarpostid}`
    }

    const usr_data_list = {
        username: 'Имя: ',
        login: 'Логин: ',
        creationdate: 'Профиль создан: ',
        postsCount: 'Количество постов: '
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
            case 'postsCount': {
                ln.innerHTML = usr_data_list[line]
                const act = createAction(userData.data[line], ln, () => {
                    window.location.href = `/search?tags=author:${userData.data.login}`
                })
                act.title = 'Посмотреть посты пользователя'
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
    label.innerText = 'Действия'

    //region owner
    if (userData.isOwner) {

        //region unlog
        createAction('Выйти из аккаунта', container, () => Authy.unlogin())

        //region ch username
        createAction('Сменить имя пользователя', container, async () => {
            const new_name = prompt('Введите новое имя пользователя:', userData.data.username)
            if (new_name) {
                const rslt = await request('changeUserName', { userKey: localStorage.getItem('userKey') || sessionStorage.getItem('userKey'), newName: new_name })

                if (rslt.rslt == 's') {
                    window.location.href = `/profile?alert=s/Имя+пользователя+изменено+успешно!/5000`
                } else {
                    alert(rslt.msg, 5000)
                }
            }
        })

        //region ch pass
        createAction('Сменить пароль', container, async () => {
            const new_pasas = prompt('Введите новый пароль:')
            if (new_pasas) {
                const rslt = await request('changeUserPassword', { userKey: localStorage.getItem('userKey') || sessionStorage.getItem('userKey'), newPassword: CryptoJS.SHA256(new_pasas).toString() })
                alert(rslt.msg, 5000)
            }
        })

        //region tg bot link
        createAction('Телеграм бот', container, async () => {
            window.open('https://t.me/pi_archive_bot', '_blank').focus();
        })

        //region cp ukey
        createAction('Скопировать ключ пользователя', container, async () => {
            const userKey = localStorage.getItem('userKey') || sessionStorage.getItem('userKey');

            copyToClipboard(userKey, 'Ключ пользователя скопирован')
        })

        //region ch blklist
        createAction('Изменить чёрный список', container, async () => {
            const blacklist = activeUser.data.blacklist.join('\n')

            const new_blacklist = await showPopup('Измените чёрный список', blacklist)
            if (blacklist != new_blacklist) {
                const result = await request('updateBlacklist', {
                    userKey: localStorage.getItem('userKey') || sessionStorage.getItem('userKey'),
                    blacklist: new_blacklist.split(/\s+|\n+|\,/).filter(val => val !== '')
                })
                alert(result.msg)
            }
        })

        //region edit grp
        createAction('Редактировать группу', container, async () => {
            const container = createBlurOverlay()

            container.addEventListener('click', (e) => {
                if (e.target === container) {
                    container.remove()
                }
            })

            const selector_div = createDiv('group-editor-selector-container')
            container.appendChild(selector_div)

            const user_post_groups = await request('controlGroup', { type: 'getMyGroups' })
            const groups_select = []
            for (const grp of user_post_groups.groups) {
                groups_select.push({ name: `ID:${grp.id}|${grp.name}`, value: grp.id })
            }
            const group_selector = createSelect(groups_select, "Выберите группу", async (value) => {
                selector_div.remove()

                const selected_group = user_post_groups.groups.find(item => item.id == value)

                const reord_over = reorderOverlay(selected_group, true, true, async (result, data) => {
                    switch (result) {
                        case 'cancel': {
                            container.remove()
                        }; break;
                        case 'delete': {
                            if (confirm(`Вы уверены что хотите удалить группу ID:${selected_group.id}|${selected_group.name}`)) {
                                const deleteResult = await request('controlGroup',
                                    {
                                        type: 'deleteGroup',
                                        groupID: selected_group.id
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
                                    groupID: selected_group.id
                                })
                            if (reorderResult.rslt == 's') {
                                container.remove()
                            }
                            alert(`${reorderResult.rslt}/${reorderResult.msg}`, 5000)
                        }; break;
                        case 'rename': {
                            container.remove()
                            const new_name = showPopup(title = 'Измените название группы', defaultText = selected_group.name)
                            new_name.then(async value => {
                                if (value) {
                                    const rename_result = await request('controlGroup',
                                        {
                                            type: 'renameGroup',
                                            groupID: selected_group.id,
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
            selector_div.appendChild(group_selector)
        })
    } else {
        //region wr msg
        createAction('Написать сообщение', container, async () => {
            const message_data = await showPopup('Введите текст сообщения')
            if (message_data) {
                const message_result = await request('sendMessage', {
                    message: message_data,
                    from: activeUser.data.login,
                    to: userData.data.login,
                    msgtype: 'DM'
                })
                if (message_result.rslt == 's')
                    alert('s/Сообщение успешно отправлено', 5000)
                else
                    alert(message_result.msg, 5000)
            }
        })
        if (activeUser.data.acc_level > 1) {

        } else {

        }
    }
}

async function getFavs(favs) {
    const favs_container = createDiv('favs-container', document.querySelector('.user-page-container'))

    const fav_label = createDiv('label', favs_container)
    fav_label.innerHTML='Избранное'

    const favs_zone = createDiv('favs-zone', favs_container)

    for (const favID of favs) {
        const pcard = createPostCard((await request('getPostData', { id: favID })).post)
        favs_zone.appendChild(pcard)
    }
}