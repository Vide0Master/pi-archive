
const bd = document.querySelector("body")
const notf_cont = document.createElement('div')
bd.appendChild(notf_cont)
notf_cont.id = 'notification-container'
notf_cont.className = 'notification-container'
window.alert = function (message, timeout) {
    return createNotification(message, timeout);
};

function createNotification(str, timeout = 0) {
    let type = "";
    let message = str;

    if (str.split('')[1] == "/") {
        type = str[0];
        message = str.slice(2);
    }

    if (timeout == 0) {
        message+=`<br><br>${Language.alert.remove}`
    }

    const container = document.getElementById('notification-container');

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `<span>${message}</span>`;

    container.insertBefore(notification, container.firstChild);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    if (timeout > 0) {
        var timer = setTimeout(() => {
            removeNotification(notification);
        }, timeout);
    }

    

    if (!timeout >= 0) {
        notification.addEventListener('click', () => {
            clearTimeout(timer)
            removeNotification(notification)
        })
    }

    return function () {
        clearTimeout(timer)
        removeNotification(notification)
    }
}

function removeNotification(notification) {
    notification.classList.add('removing-element')
    setTimeout(() => {
        const container = document.getElementById('notification-container');
        container.removeChild(notification);
    }, 700);
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