let Language = {}
let LangData = {}
function getLang() {
    if (!localStorage.getItem('lang')) {
        localStorage.setItem('lang', 'ENG')
    }
    const langDataFromServer = loadJSONSync(`/lang/${localStorage.getItem('lang')}.json`)
    Language = langDataFromServer.lang.WEB
    LangData = { name:langDataFromServer.name}
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