function styledConsoleWarning(msg, style) {
    // const message = "Внимание! Консоль предназначена для разработчиков. Если кто-то сказал вам сюда что-то вставить, это может быть мошенничеством.";
    // const style = "color: red; font-size: 20px; font-weight: bold; padding: 10px;";

    console.log("%c" + msg, style);
}

if (localStorage.getItem('DEV') == 'SEXGAY') {
    styledConsoleWarning('ВКЛЮЧЁН РЕЖИМ РАЗРАБОТЧИКА!', 'color: red; font-size: 4em; font-weight: bold;')
    styledConsoleWarning('Если ты залез в код файла APIrequest.js и увидел там строку...', 'color: #fff; font-size: 1.2em; font-weight: bold;')
    styledConsoleWarning(`const DEVMODE = localStorage.getItem('DEV') === 'SEXGAY'`, 'color: cyan; font-size: 1em; font-weight: bold;')
    styledConsoleWarning('Ты молодец что смог найти редактор локального хранилища.. но.', 'color: #fff; font-size: 1.2em; font-weight: bold;')
    styledConsoleWarning('ОЧИСТИ ХРАНИЛИЩЕ!', 'color: red; font-size: 5em; font-weight: bold;')
    styledConsoleWarning(`Я создавал консоль для отладки программы и не хотел-бы что-бы сюда лезли "датамыйнеры" в поисках чего-то среди тонн говнокода.`, 'color: cyan; font-size: 1.3em; font-weight: bold;')
    styledConsoleWarning('Спасибо ;)', 'color: #fff; font-size: 1.2em; font-weight: bold;')
} else {
    styledConsoleWarning('ВНИМАНИЕ!', 'color: red; font-size: 2em; font-weight: bold;')
    styledConsoleWarning('Консоль предназначена для разработчиков.', 'color: cyan; font-size: 1.2em; font-weight: bold;')
    styledConsoleWarning('Не нужно здесь ничего делать пока это не требуется!', 'color: #fff; font-size: 1.2em; font-weight: bold;')
    styledConsoleWarning('Разработчик и так постарался сделать систему настолько рабочей...\nНасколько это возможно для отсутствия потребности вхождения сюда.', 'color: #fff; font-size: 1.2em; font-weight: bold;')
}

styledConsoleWarning('by VideoMaster', `
    font-size: 50px;
    font-weight: bold;
    background: linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8f00ff);
    background-size: 100% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    `)
styledConsoleWarning(`P.S.\n- к сожалению за кражу и модификацию кода я наказать не могу, но попрошу так не делать, спасибо ;)`, 'color: #FFF; font-size: 1em; font-weight: bold;')