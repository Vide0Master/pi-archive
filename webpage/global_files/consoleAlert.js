function styledConsoleWarning(msg, style) {
    console.log("%c" + msg, style);
}

if (localStorage.getItem('DEV') == 'BONDAGE') {
    styledConsoleWarning('DEV MODE ENABLED!', 'color: red; font-size: 4em; font-weight: bold;')
    styledConsoleWarning(`If you saw const DEVMODE = localStorage.getItem('DEV') === 'BONDAGE'`, 'color: cyan; font-size: 1em; font-weight: bold;')
    styledConsoleWarning('Congratulations! You know how to "hack" some websites. But.', 'color: #fff; font-size: 1.2em; font-weight: bold;')
    styledConsoleWarning('RESET YOUR LOCALSTORAGE!', 'color: red; font-size: 5em; font-weight: bold;')
    styledConsoleWarning(`I made this mode only for testing and debugging. You can use this if you know what you are doing and want to fill detailed bug report.`, 'color: cyan; font-size: 1.3em; font-weight: bold;')
} else {
    styledConsoleWarning('WARNING!', 'color: red; font-size: 2em; font-weight: bold;')
    styledConsoleWarning('Console is made for developers.', 'color: cyan; font-size: 1.2em; font-weight: bold;')
    styledConsoleWarning('Dont look here until it\'s needed!', 'color: #fff; font-size: 1.2em; font-weight: bold;')
    styledConsoleWarning('Developer made system as stable as possible...\nStable to state that you don\'t need to look here.', 'color: #fff; font-size: 1.2em; font-weight: bold;')
}

styledConsoleWarning('by VideoMaster', `
    font-size: 50px;
    font-weight: bold;
    background: linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8f00ff);
    background-size: 100% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    `)
styledConsoleWarning(`P.S.\n- Read EULA, dont be a dork.`, 'color: #FFF; font-size: 1em; font-weight: bold;')