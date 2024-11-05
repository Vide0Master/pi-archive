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

document.getElementById('login_btn').addEventListener('click', () => login())

document.querySelector('.login-block .label').innerHTML = Language.login.label
document.querySelector('.user-data #login').setAttribute('placeholder', Language.login.txt.login)
document.querySelector('.user-data #password').setAttribute('placeholder', Language.login.txt.pass)
document.querySelector('.user-data .checkbox div').innerHTML = Language.login.remember
document.querySelector('.login-block a').innerHTML = Language.login.noacc
document.querySelector('.login-block #login_btn').value = Language.login.logIn