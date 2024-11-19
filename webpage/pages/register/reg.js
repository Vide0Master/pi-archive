const form = document.querySelector(".registration-form");

const nickname = document.getElementById("nickname");
const login = document.getElementById("login");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirm-password");
const adminMessage = document.getElementById("admin-message");

function checkPass() {
    const passGood = password.value == confirmPassword.value
    if (!passGood) {
        confirmPassword.style.outline = '2px solid red'
    }else{
        confirmPassword.removeAttribute('style')
    }
    return passGood
}

password.addEventListener('update', checkPass)
confirmPassword.addEventListener('update', checkPass)

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!checkPass()) {
        alert("e/Passwords do not match!", 5000);
        return;
    }

    const userdata = {
        login: login.value,
        username: nickname.value,
        password: hashPassword(password.value),
        admin_message: adminMessage.value
    }

    const reslt = await request('register', userdata)
    alert(reslt.rslt + '/' + reslt.msg, 5000)
});

function hashPassword(password) {
    return CryptoJS.SHA256(password).toString();
}


