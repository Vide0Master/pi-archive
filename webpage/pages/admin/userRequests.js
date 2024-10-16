async function updateRequestList() {

    const data = await request('getAdminRequests')
    console.log(data)
    const request_list = document.querySelector('.user-requests-block').querySelector('.list')
    request_list.innerHTML = ''
    const request_list_label = document.querySelector('.user-requests-block').querySelector('.label')

    request_list_label.innerHTML = `Заявок пользователей: ${data.length}`

    for (const user_request of data) {

        const req_card = document.createElement('div')
        request_list.appendChild(req_card)
        req_card.className = 'req-card'

        req_card.innerHTML = `
                        <div class="main-data">
                            <div class="data">
                                <div>ID#${user_request.messageid}</div>
                                <div>Дата: ${user_request.timestamp}</div>
                                <div>Тип запроса: ${user_request.msgtype}</div>
                                <div>От: ${user_request.from}</div>
                            </div>
                            <div class="message">Сообщение: ${user_request.message}</div>
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