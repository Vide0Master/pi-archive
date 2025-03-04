function styledConsoleWarning(msg, style) {
    console.log("%c" + msg, style);
}

if (localStorage.getItem('DEV') == 'BONDAGE') {
    styledConsoleWarning('DEV MODE ENABLED!', 'color: red; font-size: 4em; font-weight: bold;')
} else {
}

// Pi-Archive with metallic gradient
styledConsoleWarning('Pi-Archive', `
    font-size: 50px;
    font-weight: bold;
    background: linear-gradient(45deg, #7f7f7f, #bfbfbf, #e0e0e0, #ffffff, #e0e0e0, #bfbfbf, #7f7f7f);
    background-size: 100% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
`);

// By VideoMaster with rainbow gradient
styledConsoleWarning('by VideoMaster', `
    font-size: 50px;
    font-weight: bold;
    background: linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8f00ff);
    background-size: 100% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
`);

// P.S. message
styledConsoleWarning(`P.S.\n- Read EULA, dont be a dork.`, 'color: #FFF; font-size: 1em; font-weight: bold;');