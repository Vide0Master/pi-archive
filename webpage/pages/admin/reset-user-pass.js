//

document.querySelector('.reset-user-pass').addEventListener('click', async () => {
    const users_list = await request('resetUserPassContr', { type: 'getUsers' })
    console.log(users_list)

    const background = createBlurOverlay()

    const selValues = []
    selValues.push({ value: 'cn', name: 'Cancel' })
    for (const usr of users_list.users) {
        selValues.push({ value: usr, name: usr })
    }

    const sel = createSelect(selValues, placeholder = 'Select user', async (selVal) => {
        if (selVal != 'cn') {
            const updRslt = await request('resetUserPassContr', { type: 'resetPass', user: selVal })
            if(updRslt.rslt=='s'){
                copyToClipboard(updRslt.newPass, 'New user pass copied to clipboard')
            }else{
                alert(`${updRslt.rslt}/${updRslt.msg}`)
            }
        }
        background.remove()
    })
    background.appendChild(sel)
})