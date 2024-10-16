getMessages()

async function getMessages() {
    const DMs = await request('controlUserDM', { type: 'getUserDMs' })

    const chat_column = document.querySelector('.chat-column')
    for (const dm of DMs) {
        const user_dm_opener = createDiv('user-db-link', chat_column)

        const comment_author = createAction('', user_dm_opener)
        parseUserLogin(dm, comment_author)


        const userAvatarID = (await request('getUserProfileData', { login: dm })).data.avatarpostid
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
            time_info.innerHTML = parseTimestmap(msg.timestamp)

            const read_status = createDiv('msg-gray-text', message_header)
            read_status.innerHTML = msg.read == 0 ? "Не прочитано" : "Прочитано"

            const msgText = createDiv('text', messageBlock)
            msgText.innerHTML = msg.message

            if (msg.read == 0 && msg.from == user) {
                console.log('marked ' + msg.message)
                onElementFullyVisible(msgText, async () => {
                    console.log('прочитал?')
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