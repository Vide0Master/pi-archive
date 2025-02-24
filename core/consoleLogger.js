// Compact console logger with colored output and timestamp

const colors = {
    black: 30, red: 31, green: 32, yellow: 33, blue: 34, magenta: 35, cyan: 36, white: 37,
    brightBlack: 90, brightRed: 91, brightGreen: 92, brightYellow: 93, brightBlue: 94,
    brightMagenta: 95, brightCyan: 96, brightWhite: 97
};

/**
 * Logs messages with colored formatting
 * @param {string} text "type/message" or "message" 
 * @param {Array<{txt: string, txtc: string, txtb: string}>} [tags=[]] Prefix tags
 */
module.exports = function (text, tags = []) {
    const [type, line] = text.includes('/') ? text.split(/(.+?)\/(.*)/).slice(1, 3) : ['', text];

    const timestamp = colorize(` ${formatDate()} `, 'white', 'cyan');
    const prefixes = tags.map(t => colorize(` ${t.txt} `, t.txtc, t.txtb)).join('');

    const typeStyles = {
        e: [' ERR ', 'white', 'red'],
        ce: [' !CERR! ', 'red', 'black'],
        s: [' OK ', 'black', 'green'],
        w: [' WARN ', 'black', 'yellow'],
        i: [' INF ', 'white', 'blue'],
        uwu: [' UWU ', 'magenta', 'white'],
        owo: [' OWO ', 'magenta', 'white']
    };

    const logLine = typeStyles[type]
        ? colorize(...typeStyles[type]) + ` ${line}`
        : ` ${line}`;

    console.log(timestamp + prefixes + logLine);
};

/** Colorizes text using ANSI codes */
const colorize = (text, fg, bg) => {
    const codes = [colors[fg], bg && colors[bg] + 10].filter(Boolean);
    return `\x1b[${codes.join(';')}m${text}\x1b[0m`;
};

/** Formats current date as DD.MM.YYYY HH:mm:ss */
const formatDate = () => {
    const pad = n => n.toString().padStart(2, '0');
    const d = new Date();
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)} ` +
        `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};