function hashPassword(password) {
    return CryptoJS.SHA256(password).toString();
}

async function login() {
    function gebid(id) { return document.getElementById(id) }
    const login_data = {
        login: gebid('login').value,
        password: await hashPassword(gebid('password').value),
        stay_logged_in: gebid('stay_logged_in').checked
    }
    const login_result = await Authy.login(login_data)
    if (login_result.rslt == 's') {
        window.location.href = '/'
    } else {
        alert(login_result.msg, 5000)
    }
}

document.querySelector('.login-form').addEventListener('submit',(e)=>{
    e.preventDefault()
    login()
})