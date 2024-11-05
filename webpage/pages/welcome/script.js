const desc = document.querySelector('.description')
for (let i = 0; i < 2; i++) {
    const dskl = document.createElement('div')
    dskl.innerHTML = Language.welcome.desc[i]
    desc.appendChild(dskl)
}

const btnRow = document.querySelector('.button-row')

const login = document.createElement('input')
login.value=Language.welcome.btnRow[0]
login.type = 'button'
login.addEventListener('click', () => {
    window.location.href = '/login'
})
btnRow.appendChild(login)

const register = document.createElement('input')
register.value=Language.welcome.btnRow[1]
register.type = 'button'
register.addEventListener('click', () => {
    window.location.href = '/register'
})
btnRow.appendChild(register)