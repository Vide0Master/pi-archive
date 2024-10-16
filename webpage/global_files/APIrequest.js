const DEVMODE = localStorage.getItem('DEV') === 'SEXGAY'

async function request(action, request) {
    function keyCheck() {
        let userKey = localStorage.getItem('userKey')
        if (userKey == null || userKey == '') {
            userKey = sessionStorage.getItem('userKey')
            if (userKey == null || userKey == '') {
                userKey = ''
            }
        }
        return userKey
    }

    try {
        const response = await fetch('/api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action,
                request,
                user: keyCheck()
            }),
        });
        if (!response.ok) {
            return 'response_error'
        }
        const data = await response.json();
        if (DEVMODE) console.log(`[API {${action}}]:`, data)
        return data
    } catch (error) {
        console.error('Ошибка запроса:', error);
        return 'request_error'
    }
}