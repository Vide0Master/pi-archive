let activeDM = ''

async function MessageProcessor() {
    const container = createDiv('container', document.querySelector('main'))

    const usersCol = createDiv('user-col', container)
    const messagerCol = createDiv('messager-col', container)

    const messagesCont = createDiv('messages-cont', messagerCol)
    const chatSel = createDiv('chat-select', messagesCont)
    chatSel.innerHTML = Language.messages.chSel + "..."

    const writerLine = createDiv('writer-line', messagerCol)

    const textInput = document.createElement('textarea')
    writerLine.appendChild(textInput)
    textInput.placeholder = Language.messages.enterMessage + '...'

    textInput.addEventListener('keydown', e => {
        if (e.key == 'Enter' && !e.shiftKey) {
            e.preventDefault()
            if (activeDM == '') {
                alert('w/' + Language.messages.chSel, 3000)
                return
            }
            WSSend('sendDMMessage', {
                message: formatUserText(textInput.value),
                to: activeDM
            })
            textInput.value = ''
        }
    })

    const sendBtn = createButton(Language.messages.sendBtn, writerLine)
    sendBtn.addEventListener('click', () => {
        if (activeDM == '') {
            alert('w/' + Language.messages.chSel, 3000)
            return
        }
        WSSend('sendDMMessage', {
            message: formatUserText(textInput.value),
            to: activeDM
        })
        textInput.value = ''
    })

    const DMs = await request('controlUserDM', { type: 'getUserDMs' })
    for (const DM of DMs) {
        const userData = await request('getUserProfileData', { userKey: localStorage.getItem('userKey') || sessionStorage.getItem('userKey'), login: DM.login })
        const userRow = createDiv('user-line', usersCol)

        if (userData.data.usersettings.ProfileAvatarPostID) {
            const avatar_block = createDiv('pfp-cont', userRow)
            avatar_block.style.borderRadius = '1.5em'

            const avatar = document.createElement('img')
            avatar_block.appendChild(avatar)
            avatar.src = `/file?userKey=${localStorage.getItem('userKey') || sessionStorage.getItem('userKey')}&id=${userData.data.usersettings.ProfileAvatarPostID}&thumb=true`
        } else {
            const avatar_block = createDiv('pfp-cont')
            userRow.appendChild(avatar_block)

            const TN = createDiv('temp-name', avatar_block)
            TN.innerHTML = userData.data.username.substring(0, 2)
        }

        const nameAndLastMessageCol = createDiv('NnLMC', userRow)
        const userName = createDiv('user-name', nameAndLastMessageCol)
        parseUserLogin(DM.login, userName)

        const lastMsgNcnt = createDiv('last-msg-n-cnt-row', nameAndLastMessageCol)
        const lastMessage = createDiv('last-msg', lastMsgNcnt)
        if (DM.login != DM.messages[0].from) {
            lastMessage.innerHTML = `${Language.messages.you}: `
        }
        lastMessage.innerHTML += DM.messages[0].message

        const msgCount = createDiv('msg-counter-dm', lastMsgNcnt)
        function updateUnreadCounter(count) {
            if (count > 0) {
                msgCount.innerHTML = count
                msgCount.removeAttribute('style')
            } else {
                msgCount.style.display = 'none'
            }
        }
        updateUnreadCounter(DM.unread || 0)
        WSListener('messageCountUpdate', '', (data) => {
            if (!data.count.unreadPerUser[DM.login]) {
                updateUnreadCounter(0)
            } else {
                updateUnreadCounter(data.count.unreadPerUser[DM.login])
            }
        })

        const messagesElem = createDiv('user-messages', messagesCont)
        messagesElem.style.display = 'none'

        function insertMessage(msgData) {
            const msgCont = createDiv('msg-cont')
            msgCont.id = msgData.messageid
            messagesElem.prepend(msgCont)
            if (msgData.to == DM.login) {
                msgCont.classList.add('out')
            } else {
                msgCont.classList.add('in')
            }

            const text = createDiv('msg-text', msgCont)
            text.innerHTML = msgData.message

            const postMatches = Array.from(msgData.message.matchAll(/#(\d+)/g), match => match[1])
            if (postMatches.length > 0) {
                const postRow = createDiv('post-row', msgCont)

                async function insertPosts(posts) {
                    const post_list = await request('getPosts',
                        {
                            query: `id:${posts.join(',')}`,
                            page: 1,
                            postsCount: 9999,
                            grpOverride: true
                        })

                    for (const postData of post_list) {
                        postRow.appendChild(createPostCard(postData))
                    }
                }
                insertPosts(postMatches)
            }

            const dataRow = createDiv('data-row', msgCont)

            const created = createDiv('time', dataRow)
            created.innerHTML = parseTimestamp(msgData.timestamp)

            const read = createDiv('readIndicator', dataRow)
            const imgelem = document.createElement('img')
            read.appendChild(imgelem)
            imgelem.src = 'read.svg'
            if (msgData.read == 1) {
                read.removeAttribute('style')
            } else {
                read.style.display = 'none'
            }

            WSListener('messageReadStatus', msgData.messageid, (data) => {
                if (data.status == 1) {
                    read.removeAttribute('style')
                } else {
                    read.style.display = 'none'
                }
            })

            if (msgData.read != 1) {
                if (msgData.to != DM.login) {
                    onElementFullyVisible(msgCont, () => {
                        WSSend('messageRead', { id: msgData.messageid, user: DM.login, status: 1 })
                    })
                }
            }
            return msgCont
        }

        for (let i = DM.messages.length - 1; i >= 0; i--) {
            insertMessage(DM.messages[i])
        }

        WSListener('transmitMessage', DM.login, (data) => {
            const msgElem = insertMessage(data.msg)
            msgElem.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            })
            lastMessage.innerHTML = ''
            if (DM.login != data.msg.from) {
                lastMessage.innerHTML = `${Language.messages.you}: `
            }
            lastMessage.innerHTML += data.msg.message
        })

        userRow.addEventListener('mousedown', (e) => {
            e.preventDefault()
            if (e.button == 1) {
                window.open(`/profile?user=${DM.login}`, '_blank');
                return
            }
            if (e.shiftKey) {
                if (e.ctrlKey) {
                    window.open(`/profile?user=${DM.login}`, '_blank');
                } else {
                    window.location.href = `/profile?user=${DM.login}`
                }
                return
            }
            Array.from(messagesCont.children).forEach(child => {
                child.style.display = 'none';
            });
            Array.from(usersCol.children).forEach(child => {
                child.classList.remove('active')
            });
            messagesElem.removeAttribute('style')
            userRow.classList.add('active')
            activeDM = DM.login
        })
    }

}

MessageProcessor()

