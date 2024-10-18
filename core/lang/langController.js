const fs = require('fs');
const path = require('path');
const cmd = require('../consoleLogger')

class LanguageManager {
    static availableLanguages = [];
    static translations = {};
    static parseLine(line, lang) {
        // Проверяем, есть ли в строке шаблон вида {{...}}
        if (!line.includes('{{')) {
            return line;  // Если шаблона нет, возвращаем строку как есть
        }

        return line.replace(/{{(.*?)}}/g, (_, key) => {
            const path = key.split('_');  // Разделяем строку по "_", чтобы получить путь к свойствам объекта
            let value = lang;

            // Проходим по каждому ключу пути в объекте
            for (const part of path) {
                value = value?.[part];
                if (value === undefined) {
                    return `{{${key}}}`;  // Если значение не найдено, возвращаем исходный шаблон
                }
            }

            return value;  // Заменяем шаблон на найденное значение
        });
    }
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
