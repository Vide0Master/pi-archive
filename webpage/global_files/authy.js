
let userKey = ''

class Authy {
    static keyCheck() {
        userKey = localStorage.getItem('userKey')
        if (userKey == null || userKey == '') {
            userKey = sessionStorage.getItem('userKey')
            if (userKey == null || userKey == '') {
                userKey = ''
            }
        }
    }

    static generateKey(key_length) {
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz0123456789".split('')
        let key = ''
        for (let i = 0; i < key_length; i++) {
            key += alphabet[Math.floor(Math.random() * alphabet.length)]
        }
        return key
    }

    static async pageAccesCheck() {
        const rslt = await request('AuthyPageAccessCheck', { page: window.location.pathname.replace(/\//g, '')})
        if (rslt.rslt != 's') {
            await this.unlogin()
        }
    }

    static async login(loginData) {
        userKey = this.generateKey(30)
        if (loginData.stay_logged_in) {
            localStorage.setItem('userKey', userKey)
        } else {
            sessionStorage.setItem('userKey', userKey)
        }
        loginData.userKey = userKey
        const resp = await request('login', loginData)
        return resp
    }

    static async loginCheck() {
        const rslt = await request('loginCheck', { userKey: userKey })
        if (rslt.rslt = 's') {
            window.location.href = '/search'
        }
    }

    static async unlogin() {
        sessionStorage.clear()
        localStorage.clear()
        window.location.href = '/'
    }
}

Authy.keyCheck()
Authy.pageAccesCheck()

if (['welcome', 'register', 'login'].includes(window.location.pathname.replace(/\//g, '')) && userKey != '') {
    Authy.loginCheck()
}