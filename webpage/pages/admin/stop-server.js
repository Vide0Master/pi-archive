document.querySelector('.server-stop-btn').addEventListener('click', async () => {
    if (confirm(Language.admin.sysStop.stopQ)) {
        const reqRslt = await request('stopAPP')
        alert(reqRslt.rslt + '/' + reqRslt.msg,5000)
    }
})