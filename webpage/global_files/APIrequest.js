const DEVMODE = localStorage.getItem('DEV') === 'BONDAGE'

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
                user: {
                    key: keyCheck(),
                    type: 'WEB'
                }
            }),
        });
        if (!response.ok) {
            return 'response_error'
        }
        const data = await response.json();
        if (DEVMODE) console.log(`[API {${action}}${!!request ? !!request.type ? ` TYPE:{${request.type}}` : '' : ''}]:`, data)
        return data
    } catch (error) {
        console.error('Request error:', error);
        return 'request_error'
    }
}