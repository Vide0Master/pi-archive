const adminLang = Language.admin

document.querySelector('.user-requests-block .label').innerHTML = adminLang.labels.userReq
document.querySelector('.tag-group-control .label').innerHTML = adminLang.labels.tagGroupsCntrl
document.querySelector('.groups-list-container .label').innerHTML = adminLang.labels.tagGroupList
document.querySelector('.create-group-container .label').innerHTML = adminLang.labels.crTagGroup
document.querySelector('.dangerous-options .label').innerHTML = adminLang.labels.danger.label
document.querySelector('.dangerous-options .server-stop-btn').value = adminLang.labels.danger.stop
document.querySelector('.dangerous-options .reset-user-pass').value = adminLang.labels.danger.passRes

async function updateRequestList() {
    let data = await request('getAdminRequests')
    if (data.rslt != 's') {
        return
    } else {
        data = data.requests
    }
    if (DEVMODE) console.log(data)
    const request_list = document.querySelector('.user-requests-block').querySelector('.list')
    request_list.innerHTML = ''
    const request_list_label = document.querySelector('.user-requests-block').querySelector('.label')

    request_list_label.innerHTML = `${adminLang.labels.userReq}: ${data.length}`

    for (const user_request of data) {

        const req_card = document.createElement('div')
        request_list.appendChild(req_card)
        req_card.className = 'req-card'

        req_card.innerHTML = `
                        <div class="main-data">
                            <div class="data">
                                <div>ID#${user_request.messageid}</div>
                                <div>Date: ${user_request.timestamp}</div>
                                <div>Request type: ${user_request.msgtype}</div>
                                <div>From: ${user_request.from}</div>
                            </div>
                            <div class="message">Message: ${user_request.message}</div>
                        </div>`

        const action_row = document.createElement('div')
        req_card.appendChild(action_row)
        action_row.className = 'action-row'

        switch (user_request.msgtype) {
            case 'REGISTER': {
                const accept = document.createElement('input')
                accept.type = 'button'
                accept.setAttribute('value', 'Принять')
                const reject = document.createElement('input')
                reject.type = 'button'
                reject.setAttribute('value', 'Отказать')
                action_row.appendChild(reject)
                action_row.appendChild(accept)

                accept.addEventListener('click', async () => {
                    const rslt = await request('userConfirmation', { type: 'confirm', login: user_request.from, messageID: user_request.messageid })
                    alert(rslt.rslt + '/' + rslt.msg, 5000)
                    updateRequestList()
                })

                reject.addEventListener('click', async () => {
                    const rslt = await request('userConfirmation', { type: 'reject', login: user_request.from, messageID: user_request.messageid })
                    alert(rslt.rslt + '/' + rslt.msg, 5000)
                    updateRequestList()
                })
            }; break;
        }
    }
}

updateRequestList()