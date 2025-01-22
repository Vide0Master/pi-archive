
const body = document.querySelector("body")
const notificationContainer = document.createElement('div')
body.appendChild(notificationContainer)

notificationContainer.className = 'notification-container'

const notifications = {}

class Notify {
    constructor(message, timeout = 5000, color = '#fff', type, callBack, callBackParams = {}, callBackAfterTimer) {
        if (notifications[message]) {
            notifications[message].highlight()
            return false
        } else {
            notifications[message] = this
        }

        this.message = message
        this.timeout = timeout
        this.color = color
        this.type = ''
        this.callBack = callBack
        this.callBackParams = callBackParams
        this.isPresent = true
        this.callBackAfterTimer = callBackAfterTimer

        this.notificationElem = document.createElement('div')
        this.notificationElem.classList.add('notification')
        this.notificationElem.setAttribute('style', `--notification-color: ${this.color};`)
        notificationContainer.appendChild(this.notificationElem)

        this.remove = () => {
            this.notificationElem.remove()
            this.isPresent = false
            delete notifications[this.message]
        }

        this.initTimer = (time) => {
            setTimeout(() => {
                if (this.callBackAfterTimer) this.callBackAfterTimer()
                this.remove()
            }, time)
            const timerBar = document.createElement('div')
            timerBar.classList.add('timer-bar')
            this.notificationElem.appendChild(timerBar)
            timerBar.style.animation = `timer ${time}ms linear forwards`
        }

        this.highlight = () => {
            this.notificationElem.classList.add('highlight')
            this.notificationElem.addEventListener('animationend', () => {
                this.notificationElem.classList.remove('highlight')
            })
        }

        switch (type) {
            //region custom
            case 'custom': break;
            //region input conf
            case 'inputConfirm': {
                const textBlock = document.createElement('span')
                textBlock.innerHTML = this.message
                this.notificationElem.appendChild(textBlock)
                this.notificationElem.classList.add('confirm-text')

                const rejectButton = document.createElement('div')
                this.notificationElem.appendChild(rejectButton)
                rejectButton.classList.add('cancel-button')
                rejectButton.innerHTML = '✖'

                const confirmButton = document.createElement('div')
                this.notificationElem.appendChild(confirmButton)
                confirmButton.classList.add('confirm-button')
                confirmButton.innerHTML = '✔'
                confirmButton.focus()

                rejectButton.onclick = () => {
                    this.remove()
                    this.callBack(false)
                }

                confirmButton.onclick = () => {
                    this.remove()
                    this.callBack(true)
                }
            }; break;
            //region input short
            case 'inputShort': {
                const textBlock = document.createElement('span')
                textBlock.innerHTML = this.message
                this.notificationElem.appendChild(textBlock)
                this.notificationElem.classList.add('input-short')

                const inputContainer = document.createElement('div')
                this.notificationElem.appendChild(inputContainer)
                inputContainer.classList.add('input-container')

                const inputLine = document.createElement('input')
                inputContainer.appendChild(inputLine)
                inputLine.type = 'text'
                this.inputField = inputLine
                inputLine.focus()

                if (this.callBackParams.placeholder) {
                    inputLine.placeholder = this.callBackParams.placeholder
                }

                if (this.callBackParams.value) {
                    inputLine.value = this.callBackParams.value
                }

                const rejectButton = document.createElement('div')
                inputContainer.appendChild(rejectButton)
                rejectButton.classList.add('cancel-button')
                rejectButton.innerHTML = '✖'

                const confirmButton = document.createElement('div')
                inputContainer.appendChild(confirmButton)
                confirmButton.classList.add('confirm-button')
                confirmButton.innerHTML = '✔'

                rejectButton.onclick = () => {
                    this.remove()
                    this.callBack(false)
                }

                confirmButton.onclick = () => {
                    this.remove()
                    this.callBack(inputLine.value)
                }

                inputLine.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter' && document.activeElement === inputLine) {
                        this.remove()
                        this.callBack(inputLine.value)
                    }
                })
            }; break;
            //region input pass
            case 'inputPass': {
                const textBlock = document.createElement('span')
                textBlock.innerHTML = this.message
                this.notificationElem.appendChild(textBlock)
                this.notificationElem.classList.add('input-short')

                const inputContainer = document.createElement('div')
                this.notificationElem.appendChild(inputContainer)
                inputContainer.classList.add('input-container')

                const inputLine = document.createElement('input')
                inputContainer.appendChild(inputLine)
                inputLine.type = 'password'
                this.inputField = inputLine
                inputLine.focus()

                if (this.callBackParams.placeholder) {
                    inputLine.placeholder = this.callBackParams.placeholder
                }

                const rejectButton = document.createElement('div')
                inputContainer.appendChild(rejectButton)
                rejectButton.classList.add('cancel-button')
                rejectButton.innerHTML = '✖'

                const confirmButton = document.createElement('div')
                inputContainer.appendChild(confirmButton)
                confirmButton.classList.add('confirm-button')
                confirmButton.innerHTML = '✔'

                rejectButton.onclick = () => {
                    this.remove()
                    this.callBack(false)
                }

                confirmButton.onclick = () => {
                    this.remove()
                    this.callBack(inputLine.value)
                }

                inputLine.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter' && document.activeElement === inputLine) {
                        this.remove()
                        this.callBack(inputLine.value)
                    }
                })
            }; break;
            //region input long
            case 'inputLong': {
                const textBlock = document.createElement('span')
                textBlock.innerHTML = this.message
                this.notificationElem.appendChild(textBlock)
                this.notificationElem.classList.add('input-long')

                const textInputContainer = document.createElement('div')
                textInputContainer.classList.add('text-input-container')
                this.textInputContainer = textInputContainer
                this.notificationElem.appendChild(textInputContainer)
                const inputLine = document.createElement('textarea')
                textInputContainer.appendChild(inputLine)
                this.inputField = inputLine
                inputLine.focus()

                inputLine.addEventListener('input', function () {
                    inputLine.style.minHeight = 'auto';
                    inputLine.style.minHeight = `${inputLine.scrollHeight}px`;
                });

                if (this.callBackParams.placeholder) {
                    inputLine.placeholder = this.callBackParams.placeholder
                }

                if (this.callBackParams.value) {
                    inputLine.value = this.callBackParams.value
                }

                const inputContainer = document.createElement('div')
                this.notificationElem.appendChild(inputContainer)
                inputContainer.classList.add('input-container')

                const rejectButton = document.createElement('div')
                inputContainer.appendChild(rejectButton)
                rejectButton.classList.add('cancel-button')
                rejectButton.innerHTML = '✖'

                const confirmButton = document.createElement('div')
                inputContainer.appendChild(confirmButton)
                confirmButton.classList.add('confirm-button')
                confirmButton.innerHTML = '✔'

                rejectButton.onclick = () => {
                    this.remove()
                    this.callBack(false)
                }

                confirmButton.onclick = () => {
                    this.remove()
                    this.callBack(inputLine.value)
                }
            }; break;
            //region input drop down
            case 'inputDropDown': {
                const textBlock = document.createElement('span')
                textBlock.innerHTML = this.message
                this.notificationElem.appendChild(textBlock)
                this.notificationElem.classList.add('input-dropdown')

                const selectElement = document.createElement('select');
                this.notificationElem.appendChild(selectElement)
                selectElement.classList.add('drop-down')
                selectElement.focus()

                if (this.callBackParams.placeholder) {
                    const placeholderOption = document.createElement('option');
                    placeholderOption.value = '';
                    placeholderOption.textContent = this.callBackParams.placeholder;
                    placeholderOption.disabled = true;
                    placeholderOption.selected = true;
                    placeholderOption.hidden = true;
                    selectElement.appendChild(placeholderOption);
                }

                if (this.callBackParams.value) {
                    selectElement.value = this.callBackParams.value
                }

                this.callBackParams.list.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.value;
                    option.textContent = item.name;
                    selectElement.appendChild(option);
                });

                const inputContainer = document.createElement('div')
                this.notificationElem.appendChild(inputContainer)
                inputContainer.classList.add('input-container')

                const rejectButton = document.createElement('div')
                inputContainer.appendChild(rejectButton)
                rejectButton.classList.add('cancel-button')
                rejectButton.innerHTML = '✖'

                const confirmButton = document.createElement('div')
                inputContainer.appendChild(confirmButton)
                confirmButton.classList.add('confirm-button')
                confirmButton.innerHTML = '✔'

                rejectButton.onclick = () => {
                    this.remove()
                    this.callBack(false)
                }

                confirmButton.onclick = () => {
                    this.remove()
                    this.callBack(selectElement.value)
                }
            };break;
            //region default
            default: {
                const textBlock = document.createElement('span')
                textBlock.innerHTML = this.message
                this.notificationElem.appendChild(textBlock)
                this.notificationElem.classList.add('msg')

                if (this.timeout > 0) {
                    this.initTimer(this.timeout)
                } else {
                    const confirmButton = document.createElement('div')
                    this.notificationElem.appendChild(rmbtn)
                    confirmButton.classList.add('confirm-button')
                    confirmButton.innerHTML = '✔'
                    confirmButton.onclick = () => {
                        this.remove()
                    }
                    confirmButton.focus()
                }
            }; break;
        }
    }
}

// new Notify('Hello World', 5000, '#fff', 'inputLong', (result) => {
//     new Notify(result, 5000, '#fff')
// }, { placeholder: 'pass' })

window.alert = (msg, time) => {
    let type = "";
    let message = msg;

    if (msg.split('')[1] == "/") {
        type = msg[0];
        message = msg.slice(2);
    }

    const typeColors = {
        'i': '#80afc6',
        'w': '#FFD54F',
        'e': '#E57373',
        's': '#81C784',
    }

    new Notify(message, time, typeColors[type])
}

function alertFromQuery() {
    const params = new URLSearchParams(window.location.search)
    const val = params.get('alert')
    if (val) {
        const parsed_alert = val.split('/')
        alert(`${parsed_alert[0]}/${parsed_alert[1]}`, parsed_alert[2])
        params.delete('alert');
        history.pushState({}, '', window.location.pathname + '?' + params.toString());
    }
}

alertFromQuery()