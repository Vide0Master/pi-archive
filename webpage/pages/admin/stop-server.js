document.querySelector('.server-stop-btn').addEventListener('click', async () => {
    new Notify(Language.admin.sysStop.stopQ, null, '#f00', 'inputConfirm', async (rslt) => {
        if (rslt) {
            const reqRslt = await request('stopAPP')
            alert(reqRslt.rslt + '/' + reqRslt.msg, 5000)
        }
    })
})