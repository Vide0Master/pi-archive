let activeDM = ''

const appealLang = Language.messages.appeal

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

    const systemUserCont = createDiv('system-block', usersCol)
    const sysPFPCont = createDiv('pfp-cont', systemUserCont)
    const sysPFPimg = document.createElement('img')
    sysPFPCont.appendChild(sysPFPimg)
    sysPFPimg.src = 'icons/Pi-symbol.svg'
    sysPFPimg.className = 'PI'
    const nameCol = createDiv('NnLMC', systemUserCont)
    const userName = createDiv('user-name', nameCol)
    userName.innerHTML = appealLang.system


    const systemMessagesElem = createDiv('system-messsages', messagesCont)
    systemMessagesElem.style.display = 'none'

    const sysMesssages = await request('controlSystemMessages', { type: 'getSystemMessages' })

    for (const sysMsg of sysMesssages.messages) {
        const msgCont = createDiv('sys-msg', systemMessagesElem)
        const header = createDiv('header', msgCont)

        const reportText = createDiv('report-name', header)
        reportText.innerHTML = `${appealLang.appeal_header.label}: ${appealLang.appeal_header[sysMsg.msgtype.split('_')[2]]}`

        const initiator_field = createDiv('initiator-cont', header)
        const initiator_text = createDiv('initiator-text', initiator_field)
        initiator_text.innerHTML = `${appealLang.initiator}:`
        const userName = createDiv('user-name', initiator_field)
        createUserName(sysMsg.specialdata.initiator, userName)

        const adressed_to = createDiv('adressed-to-cont', header)
        const adressed_to_text = createDiv('label', adressed_to)
        adressed_to_text.innerHTML = `${appealLang.adressed_to}:`
        const postData = await request('getPostData', { id: sysMsg.specialdata.reference.split('_')[1] })
        if (postData.rslt == 'w') {
            const postLabel = createDiv('label', adressed_to)
            postLabel.innerHTML = `${appealLang.post} ` + sysMsg.specialdata.reference.split('_')[1]
        } else if (postData.rslt == 'e') {
            alert(`e/${appealLang.alerts.err.postData}:\n` + postData.msg)
        } else {
            adressed_to.appendChild(createPostCard(postData.post))
        }

        if (sysMsg.specialdata.comment && ['tagEdit', 'descEdit', 'addToGroup', 'replacePost'].includes(sysMsg.msgtype.split('_')[2])) {
            const commentCont = createDiv('comment-cont', header)

            const commentHeader = createDiv('comment-header', commentCont)
            commentHeader.innerHTML = `${appealLang.comment}:`
            const commentText = createDiv('comment-text', commentCont)
            commentText.innerHTML = sysMsg.specialdata.comment
        }

        createDiv('splitter', msgCont)
        const content = createDiv('content', msgCont)

        createDiv('splitter', msgCont)
        const actions = createDiv('actions', msgCont)

        const reject = createButton('Reject', actions)
        reject.classList.add('reject-button')
        const accAutomatic = createButton('Resolve automatically', actions)
        accAutomatic.classList.add('acc-button')
        const accManual = createButton('Resolved manually', actions)
        accManual.classList.add('acc-button')

        function setActionText(state) {
            if (state == 0) return
            reject.display = 'none'
            accAutomatic.display = 'none'
            accManual.display = 'none'

            actions.innerHTML = appealLang.state[state + 1]
        }

        setActionText(sysMsg.read)

        switch (sysMsg.msgtype.split('_')[2]) {
            case 'inappropriateContent': {
                const descBlock = createDiv('description', content)
                descBlock.innerHTML = `${appealLang.description}: ` + sysMsg.specialdata.comment
                accAutomatic.style.display = 'none'
            }; break;
            case 'tagEdit': {
                const tagsCont = createDiv('tags-appeal-cont', content)

                const fullTagList = []

                for (const tag of sysMsg.specialdata.newTagsList) {
                    fullTagList.push(tag)
                }

                for (const tag of sysMsg.specialdata.oldTagsList) {
                    if (fullTagList.indexOf(tag) == -1) {
                        fullTagList.push(tag)
                    }
                }

                const newTagsList = await request('getTagsList', { taglist: fullTagList })

                const finalTagList = []
                for (const tag of newTagsList) {
                    const tagData = {
                        tag,
                        state: 0
                    }

                    if (!sysMsg.specialdata.oldTagsList.includes(tag.tag) && sysMsg.specialdata.newTagsList.includes(tag.tag)) {
                        tagData.state = 1
                    }
                    if (sysMsg.specialdata.oldTagsList.includes(tag.tag) && !sysMsg.specialdata.newTagsList.includes(tag.tag)) {
                        tagData.state = -1
                    }

                    finalTagList.push(tagData)
                }

                for (const tag of finalTagList) {
                    const tagline = createDiv('tag-row', tagsCont)

                    const tagState = createDiv('tag-state', tagline)
                    switch (tag.state) {
                        case -1: {
                            tagState.innerHTML = '−'
                            tagState.classList.add('rm')
                        }; break;
                        case 0: {
                            tagState.innerHTML = '~'
                            tagState.classList.add('n')
                        }; break;
                        case 1: {
                            tagState.innerHTML = '+'
                            tagState.classList.add('add')
                        }; break;
                    }

                    tagline.appendChild(createTagline(tag.tag, { s: false, tedit: false }))
                }

                accAutomatic.addEventListener('click', async () => {
                    new Notify(appealLang.action.tags, null, '#0f2', 'inputConfirm', async (confirmRslt) => {
                        if (confirmRslt) {
                            const rslt = await request('updateTags', { post: sysMsg.specialdata.reference.split('_')[1], newTags: sysMsg.specialdata.newTagsList });

                            if (rslt.rslt == 's') {
                                request('controlReports', { type: 'setReportStatus', id: sysMsg.messageid, state: 2 })
                                setActionText(2)
                                alert(`s/${appealLang.alerts.succ.tags}`, 5000);
                            } else {
                                alert(`e/${appealLang.alerts.err.tags}:\n` + rslt.msg, 5000);
                            }
                        }
                    })
                })
            }; break;
            case 'descEdit': {
                const desc = createDiv('desc', content)
                desc.innerHTML = `${appealLang.newDesc}: ` + sysMsg.specialdata.description

                accAutomatic.addEventListener('click', async () => {
                    new Notify(appealLang.action.desc, null, '#0f2', 'inputConfirm', async (confirmRslt) => {
                        if (confirmRslt) {
                            const rslt = await request('updatePostDesc', { postID: sysMsg.specialdata.reference.split('_')[1], newDesc: sysMsg.specialdata.description })

                            if (rslt.rslt == 's') {
                                request('controlReports', { type: 'setReportStatus', id: sysMsg.messageid, state: 2 })
                                setActionText(2)
                                alert(`s/${appealLang.alerts.succ.desc}`, 5000);
                            } else {
                                alert(`e/${appealLang.alerts.err.desc}:\n` + rslt.msg, 5000);
                            }
                        }
                    })
                })
            }; break;
            case 'addToGroup': {
                const groupData = await request('controlGroup', { type: 'getGroupByID', id: sysMsg.specialdata.groupID })
                if (groupData.rslt == 'e') {
                    alert(`e/${appealLang.alerts.err.getGroupData}:\n` + groupData.msg)
                    return
                }
                const groupDataCont = createDiv('group-info', content)
                groupDataCont.appendChild(createGroup(groupData.group))

                accAutomatic.addEventListener('click', async () => {
                    new Notify(appealLang.action.group, null, '#0f2', 'inputConfirm', async (confirmRslt) => {
                        if (confirmRslt) {
                            const rslt = await request('controlGroup', { type: 'addPost', post: sysMsg.specialdata.reference.split('_')[1], id: sysMsg.specialdata.groupID })

                            if (rslt.rslt == 's') {
                                request('controlReports', { type: 'setReportStatus', id: sysMsg.messageid, state: 2 })
                                setActionText(2)
                                alert(`s/${appealLang.alerts.succ.group}`, 5000);
                            } else {
                                alert(`e/${appealLang.alerts.err.group}:\n` + rslt.msg, 5000);
                            }
                        }
                    })
                })
            }; break;
            case 'replacePost': {
                //TODO
            }; break;
            case 'removePost': {
                const desc = createDiv('desc', content)
                desc.innerHTML = `${appealLang.removeReason}: ` + sysMsg.specialdata.comment

                accAutomatic.addEventListener('click', async () => {
                    new Notify(appealLang.action.delete, null, '#f00', 'inputConfirm', async (confirmRslt) => {
                        if (confirmRslt) {
                            const rslt = await request('deletePost', { post: sysMsg.specialdata.reference.split('_')[1] });

                            if (rslt.rslt == 's') {
                                request('controlReports', { type: 'setReportStatus', id: sysMsg.messageid, state: 2 })
                                setActionText(2)
                                alert(`s/${appealLang.alerts.succ.delete}`, 5000);
                            } else {
                                alert(`e/${appealLang.alerts.err.delete}:\n` + rslt.msg, 5000);
                            }
                        }
                    })
                })
            }; break;
        }

        reject.addEventListener('click', async () => {
            new Notify(appealLang.action.rejectAppeal, null, '#f00', 'inputConfirm', async (confirmRslt) => {
                if (confirmRslt) {
                    const result = await request('controlReports', { type: 'setReportStatus', id: sysMsg.messageid, state: -1 })
                    if (result.rslt == 'e') {
                        alert(`e/${appealLang.alerts.err.rejectAppeal}:\n` + result.msg)
                    } else {
                        setActionText(-1)
                    }
                }
            })
        })

        accManual.addEventListener('click', async () => {
            new Notify(appealLang.action.manuallyResolved, null, '#0f0', 'inputConfirm', async (confirmRslt) => {
                if (confirmRslt) {
                    const result = await request('controlReports', { type: 'setReportStatus', id: sysMsg.messageid, state: 1 })
                    if (result.rslt == 'e') {
                        alert(`e/${appealLang.alerts.err.manuallyResolved}:\n` + result.msg)
                    } else {
                        setActionText(1)
                    }
                }
            })
        })
    }

    systemUserCont.addEventListener('mousedown', (e) => {
        Array.from(messagesCont.children).forEach(child => {
            child.style.display = 'none';
        });
        Array.from(usersCol.children).forEach(child => {
            child.classList.remove('active')
        });

        systemMessagesElem.removeAttribute('style')
        writerLine.style.display = 'none'
        systemUserCont.classList.add('active')

    })

    const DMs = await request('controlUserDM', { type: 'getUserDMs' })
    for (const DM of DMs) {
        const userData = await request('getUserProfileData', { userKey: localStorage.getItem('userKey') || sessionStorage.getItem('userKey'), login: DM.login })
        if (userData.rslt == 'e') continue
        const userRow = createDiv('user-line', usersCol)

        if (userData.data.usersettings.ProfileAvatarPostID) {
            const avatar_block = createDiv('pfp-cont', userRow)
            createUserAvatarElem(userData.data.usersettings.ProfileAvatarPostID, avatar_block)
        } else {
            const avatar_block = createDiv('pfp-cont', userRow)
            const TN = createDiv('temp-name', avatar_block)
            TN.innerHTML = userData.data.username.substring(0, 2)
        }

        const nameAndLastMessageCol = createDiv('NnLMC', userRow)
        const userName = createDiv('user-name', nameAndLastMessageCol)
        createUserName(DM.login, userName, { link: false, popup: false, status: true })

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
                    onElementVisible(msgCont, () => {
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
            writerLine.removeAttribute('style')
            messagesElem.removeAttribute('style')
            userRow.classList.add('active')
            activeDM = DM.login
        })
    }

}

MessageProcessor()
