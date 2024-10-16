document.querySelector('.server-stop-btn').addEventListener('click', async () => {
    if (confirm("Вы уверены что хотите остановить сервер?")) {
        const reqRslt = await request('stopAPP')
        alert(reqRslt.rslt + '/' + reqRslt.msg,5000)
    }
})