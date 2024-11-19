const fs = require('fs');
const path = require('path');
const langDir = './lang';

const cmd = (txt) => require('./consoleLogger')(txt, [{ txt: 'LANGVERF', txtc: 'blue', txtb: 'white' }]);

function readJsonFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content, null, 4);
}

function writeJsonFile(filePath, data) {
    const content = JSON.stringify(data, null, 4);
    fs.writeFileSync(filePath, content, 'utf8');
}

function syncStructure(reference, target) {
    let updated = false;

    for (const key in target) {
        if (!(key in reference)) {
            delete target[key];
            updated = true;
        }
    }

    for (const key in reference) {
        if (!(key in target)) {
            target[key] = reference[key];
            updated = true;
        } else if (typeof reference[key] === 'object' && reference[key] !== null && !Array.isArray(reference[key])) {
            if (typeof target[key] !== 'object' || target[key] === null) {
                target[key] = {};  // Инициализируем как пустой объект, если target[key] не объект или null
                updated = true;
            }
            if (syncStructure(reference[key], target[key])) {
                updated = true;
            }
        }
    }

    return updated;
}

const referenceFilePath = path.join(langDir, 'ENG.json');
const referenceData = readJsonFile(referenceFilePath);

const files = fs.readdirSync(langDir).filter(file => file !== 'ENG.json' && file.endsWith('.json'));

files.forEach(file => {
    const filePath = path.join(langDir, file);
    let langData = readJsonFile(filePath);
    
    if (syncStructure(referenceData, langData)) {
        writeJsonFile(filePath, langData);
        cmd(`File ${file} updated to match reference structure.`);
    } else {
        cmd(`File ${file} already in sync with reference structure.`);
    }
});

cmd('Language structure check completed.');
