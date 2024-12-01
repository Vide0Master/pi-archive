

async function getMessages() {


    const chat_column = document.querySelector('.chat-column')
    for (const dm of DMs.loginsList) {
        const user_dm_opener = createDiv('user-db-link', chat_column)

        const comment_author = createAction('', user_dm_opener)
        parseUserLogin(dm, comment_author)

        const userData = await request('getUserProfileData', { login: dm })
        const userAvatarID = userData.data.usersettings.ProfileAvatarPostID
        if (userAvatarID) {
            const userAvatar = document.createElement('img')
            user_dm_opener.appendChild(userAvatar)
            userAvatar.src = `/file?userKey=${localStorage.getItem('userKey') || sessionStorage.getItem('userKey')}&id=${userAvatarID}&thumb=true`
        }

        user_dm_opener.addEventListener('click', () => openDM(dm))
    }

    const sender_block = document.querySelector('.send-row .sender')
    const sender_placeholder = document.querySelector('.send-row .placeholder')
    function setSRowToPlaceholder() {
        sender_block.style.display = 'none'
        sender_placeholder.removeAttribute('style')
    }
    function setSRowToSend() {
        sender_block.removeAttribute('style')
        sender_placeholder.style.display = 'none'
    }

    setSRowToPlaceholder()

    let reciever = ''

    async function openDM(user) {
        setSRowToSend()
        reciever = user
        document.getElementById('send-txt').value = ''

        const messages_container = document.querySelector('.messages-container')
        messages_container.innerHTML = ''

        const messages_list = await request('controlUserDM', { type: 'getUserDMMessages', login: user })

        for (const msg of messages_list.messages) {
            let blck_class = '';
            if (msg.from == user) {
                blck_class = 'msg-in'
            } else if (msg.to == user) {
                blck_class = 'msg-out'
            }
            const messageBlock = createDiv(blck_class + ' msg', messages_container)
            const message_header = createDiv('msg-header', messageBlock)
            const userName = createDiv('', message_header)
            parseUserLogin(msg.from, userName)

            const time_info = createDiv('msg-gray-text', message_header)
            time_info.innerHTML = parseTimestamp(msg.timestamp)

            const read_status = createDiv('msg-gray-text', message_header)
            read_status.innerHTML = msg.read == 0 ? "Не прочитано" : "Прочитано"

            const msgText = createDiv('text', messageBlock)
            msgText.innerHTML = msg.message

            if (msg.read == 0 && msg.from == user) {
                onElementFullyVisible(msgText, async () => {
                    const read_rslt = await request('controlUserDM', { type: 'readMessage', msgID: msg.messageid })
                    if (read_rslt.rslt == 'e') {
                        alert(read_rslt.rslt + '/' + read_rslt.msg)
                    }
                })
            }
        }
    }

    document.getElementById('send-btn').addEventListener('click', async () => {
        const sendMSGRslt = await request('controlUserDM', { type: 'sendMessage', message: formatUserText(document.getElementById('send-txt').value), to: reciever })
        if (sendMSGRslt.rslt == 's') {
            openDM(reciever)
        } else {
            alert(sendMSGRslt.rslt + '/' + sendMSGRslt.msg)
        }
    })
}

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
    textInput.placeholder = Language.messages.enterMessage+'...'

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

        const lastMessage = createDiv('last-msg', nameAndLastMessageCol)
        if (DM.login != DM.messages[0].from) {
            lastMessage.innerHTML = `${Language.messages.you}: `
        }
        lastMessage.innerHTML += DM.messages[0].message

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

            const dataRow = createDiv('data-row', msgCont)

            const created = createDiv('time', dataRow)
            created.innerHTML = parseTimestamp(msgData.timestamp)
            return msgCont
        }

        for (let i = DM.messages.length - 1; i >= 0; i--) {
            insertMessage(DM.messages[i])
        }

        WSListener('transmitMessage', DM.login, (data) => {
            insertMessage(data.msg).scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            })
        })

        userRow.addEventListener('click', () => {
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

