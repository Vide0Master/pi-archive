
//* console logger from VideoMaster

module.exports = function (text, preps = []) {

    const w_data = text.split('/');

    const line = w_data[1] || w_data[0];
    const type = w_data[1] ? w_data[0] : '';

    datetime = colorizeText(` ${parseTimestamp(new Date())} `, 'white', 'cyan')

    let result = datetime

    for (const prep of preps) {
        result += colorizeText(` ${prep.txt} `, prep.txtc, prep.txtb)
    }
    switch (type) {
        default: {
            result += ' ' + line
        }; break;
        case "e": {
            result += `${colorizeText(' ERROR ', 'white', 'red')} ${line}`
        }; break;
        case "ce": {
            result += `${colorizeText(' !!! CRITICAL ERROR !!! ', 'red', 'black')} ${line}`
        }; break;
        case "s": {
            result += `${colorizeText(' SUCCESS ', 'black', 'green')} ${line}`
        }; break;
        case "w": {
            result += `${colorizeText(' WARNING ', 'black', 'yellow')} ${line}`
        }; break;
        case "i": {
            result += `${colorizeText(' INFO ', 'white', 'blue')} ${line}`
        }; break;
        case "uwu": {
            result += `${colorizeText(' UWU ', 'magenta', 'white')} ${line}`
        }; break;
        case "owo": {
            result += `${colorizeText(' OWO ', 'magenta', 'white')} ${line}`
        }; break;
    }

    console.log(result);
};

const colors = {
    black: 30,
    red: 31,
    green: 32,
    yellow: 33,
    blue: 34,
    magenta: 35,
    cyan: 36,
    white: 37,
    brightBlack: 90,
    brightRed: 91,
    brightGreen: 92,
    brightYellow: 93,
    brightBlue: 94,
    brightMagenta: 95,
    brightCyan: 96,
    brightWhite: 97
};

/**
 * Available color names for console output
 * @typedef {'black' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white' | 'brightBlack' | 'brightRed' | 'brightGreen' | 'brightYellow' | 'brightBlue' | 'brightMagenta' | 'brightCyan' | 'brightWhite'} ColorName
 */

/**
 * Adds color to a string for console output
 * @param {string} text The text to output
 * @param {ColorName} textColor Text color
 * @param {ColorName} [backgroundColor] Background color (optional)
 * @returns {string} The colored string for console output
 */
function colorizeText(text, textColor, backgroundColor = null) {
    const reset = "\x1b[0m"; // Reset ANSI code
    const textColorCode = `\x1b[${colors[textColor]}m`; // ANSI code for text color
    const backgroundColorCode = backgroundColor ? `\x1b[${colors[backgroundColor] + 10}m` : ''; // ANSI code for background color if provided

    return `${backgroundColorCode}${textColorCode}${text}${reset}`; // Return the colored string
}

function parseTimestamp(timestamp) {
    let currentdate = new Date(Math.floor(timestamp));

    const padZero = (num) => num.toString().padStart(2, '0');

    let datetime = padZero(currentdate.getDate()) + "."
        + padZero(currentdate.getMonth() + 1) + "."
        + currentdate.getFullYear() + " "
        + padZero(currentdate.getHours()) + ":"
        + padZero(currentdate.getMinutes()) + ":"
        + padZero(currentdate.getSeconds());

    return datetime;
}