
document.querySelector('.reset-user-pass').addEventListener('click', async () => {
    const passLang = Language.admin.passControl
    const users_list = await request('resetUserPassContr', { type: 'getUsers' })

    const background = createBlurOverlay()

    const selValues = []
    selValues.push({ value: 'cn', name: passLang.canc })
    for (const usr of users_list.users) {
        selValues.push({ value: usr, name: usr })
    }

    const sel = createSelect(selValues, placeholder = passLang.selectUser, async (selVal) => {
        if (selVal != 'cn') {
            const updRslt = await request('resetUserPassContr', { type: 'resetPass', user: selVal })
            if (updRslt.rslt == 's') {
                copyToClipboard(updRslt.newPass, passLang.copy)
            } else {
                alert(`${updRslt.rslt}/${updRslt.msg}`)
            }
        }
        background.remove()
    })
    background.appendChild(sel)
})