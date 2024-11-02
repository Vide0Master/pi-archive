const fs = require('fs');
const path = require('path');
const cmd = require('../consoleLogger')

class LanguageManager {
    static availableLanguages = [];
    static translations = {};
}

const files = fs.readdirSync(__dirname);

const jsonFiles = files.filter(file => path.extname(file) === '.json');

jsonFiles.forEach(file => {
    try {
        const filePath = path.join(__dirname, file);
        const languageData = require(filePath);

        const languageKey = path.basename(file, '.json');

        if (languageData.active) {
            LanguageManager.availableLanguages.push({ name: languageData.name, id: languageKey });
        }

        LanguageManager.translations[languageKey] = languageData.lang;
    } catch (err) {
        cmd(`e/Error loading lang file ${file}: ${err}`);
    }
});

module.exports = LanguageManager;
