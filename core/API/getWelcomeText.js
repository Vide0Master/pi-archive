
const SysController = require('../systemController.js')

//экспорт функции
module.exports = (request) => {
    return new Promise(async resolve => {
        const welcome_messages = SysController.config.static.web_app.welcome_messages
        resolve(new SysController.createResponse(
            's',
            '{{S_API_GWT}}',
            {welcomeText:welcome_messages[Math.floor(Math.random()*welcome_messages.length)]}
        ))
    })
}