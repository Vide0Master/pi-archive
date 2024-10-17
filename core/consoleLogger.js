
//* console logger от VideoMaster

module.exports = function (text) {
    //получение запроса и разделение, например есть тут будет i/привет!
    const w_data = text.split('/')
    const line = w_data[1]//i
    const type = w_data[0]//привет
    //получение даты и её форматирование
    let currentdate = new Date();
    let datetime = currentdate.getDate() + "."
        + (currentdate.getMonth() + 1) + "."
        + currentdate.getFullYear() + " "
        + currentdate.getHours() + ":"
        + currentdate.getMinutes() + ":"
        + currentdate.getSeconds();
    datetime = `\x1b[46m ${datetime} \x1b[0m`

    let result = ""
    //форматирование вывода в зависимости от типа обращения
    switch (type) {
        default: {
            result = `${datetime}\x1b[0m ${line} \x1b[0m`
        }; break;
        case "e": {
            result = `${datetime}\x1b[41m\x1b[37m ERROR \x1b[0m ${line}`
        }; break;
        case "ce": {
            result = `${datetime}\x1b[41m\x1b[37m !!! CRITICAL ERROR !!! \x1b[0m ${line}`
        }; break;
        case "s": {
            result = `${datetime}\x1b[42m\x1b[37m SUCCES \x1b[0m ${line}`
        }; break;
        case "w": {
            result = `${datetime}\x1b[43m\x1b[37m WARNING \x1b[0m ${line}`
        }; break;
        case "msm": {
            result = `${datetime}\x1b[43m\x1b[37m ! MISMATCH ! \x1b[0m ${line}`
        }; break;
        case "i": {
            result = `${datetime}\x1b[44m\x1b[37m INFO \x1b[0m ${line}`
        }; break;
        case "uwu": {
            result = `${datetime}\x1b[45m\x1b[37m UwU \x1b[0m ${line}`
        }; break;
        case "owo": {
            result = `${datetime}\x1b[45m\x1b[37m OWO \x1b[0m ${line}`
        }; break;
        case "t": {
            result = `${datetime}\x1b[45m\x1b[37m TEST \x1b[0m ${line}`
        }; break;
    }
    //вывод результата
    console.log(result);
};