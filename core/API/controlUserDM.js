const sysController = require('../systemController')

async function getUserMessages(user) {
    return await sysController.dbinteract.getUserDMMessages(user)
}

module.exports = (request, user_data) => {
    return new Promise(async resolve => {
        switch (request.type) {
            case 'getUserDMs': {
                const msgs = await getUserMessages(user_data.login)
                if (msgs.rslt == 'e') {
                    resolve(msgs)
                    return
                }

                const DMs = [];

                for (const msg of msgs.messages) {
                    const contactLogin = msg.from === user_data.login ? msg.to : msg.from;

                    let DMUser = DMs.find(obj => obj.login === contactLogin);

                    if (!DMUser) {
                        DMUser = {
                            login: contactLogin,
                            messages: []
                        };
                        DMs.push(DMUser);
                    }

                    DMUser.messages.push(msg);
                }

                DMs.forEach(DMUser => {
                    DMUser.messages.sort((a, b) => b.timestamp - a.timestamp);
                    DMUser.messages.forEach(msg => {
                        if (msg.read == 0 && msg.to == user_data.login) {
                            if (!DMUser.unread) {
                                DMUser.unread = 0
                            }
                            DMUser.unread += 1
                        }
                    })
                });

                DMs.sort((a, b) => {
                    const lastMessageA = a.messages[0].timestamp;
                    const lastMessageB = b.messages[0].timestamp;
                    return lastMessageB - lastMessageA;
                });

                resolve(DMs)
            }; break;
            case 'getUserMessagesCount': {
                let messages = await getUserMessages(user_data.login)

                if (messages.rslt != 's') {
                    resolve(messages)
                    return
                }

                messages = messages.messages

                let info = { unread: 0, unreadPerUser: {}, requiredAction: false }

                for (const msg of messages) {
                    if (msg.read == 0 && msg.to == user_data.login) {
                        info.unread++
                        if (!info.unreadPerUser[msg.from]) {
                            info.unreadPerUser[msg.from] = 0
                        }
                        info.unreadPerUser[msg.from] += 1
                    }
                    if (msg.msgtype.startsWith("ACTION")) {
                        info.requiredAction = true
                    }
                }

                resolve(info)
            }; break;
            case 'getUserDMMessages': {
                const DMMs = await sysController.dbinteract.getUserDMMessages(user_data.login, request.login)
                resolve(DMMs)
            }; break;
            case 'sendMessage': {
                const sendResult = await sysController.dbinteract.createMessage(
                    {
                        message: request.message,
                        from: user_data.login,
                        to: request.to,
                        msgtype: 'DM'
                    })
                resolve(sendResult)
            }; break;
            case 'readMessage': {
                const ReadResult = await sysController.dbinteract.updateMessageReadStatus(request.msgID, 1)
                resolve(ReadResult)
            }; break;
        }
    })
}