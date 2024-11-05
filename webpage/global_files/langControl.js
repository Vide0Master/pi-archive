let Language = {}

function getLang() {
    if (!localStorage.getItem('lang')) {
        localStorage.setItem('lang', 'ENG')
    }

    Language = loadJSONSync(`/lang/${localStorage.getItem('lang')}.json`)
    Language = Language.lang.WEB
}

function setLang(lang) {
    localStorage.setItem('lang', lang)
}

function loadJSONSync(url) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, false); // `false` делает запрос синхронным
    xhr.send(null);

    if (xhr.status === 200) {
        return JSON.parse(xhr.responseText); // Преобразование JSON в объект
    } else {
        console.error(`Ошибка загрузки JSON: ${xhr.statusText}`);
        return null;
    }
}

getLang() 