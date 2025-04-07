const fs = require('fs');
const path = require('path');

const directoryPath = __dirname; // Замените на путь к вашей директории
const excludedFiles = ['package-lock.json', 'package.json', 'countAllLines.js', 'template.db']; // Замените на файлы, которые хотите исключить
const excludedDirs = ['storage', 'node_modules', '.git', 'webpage', 'lang']; // Замените на папки, которые хотите исключить

let totalLines = 0;
let totalFiles = 0;

const countLinesInFile = (filePath) => {
    return new Promise((resolve, reject) => {
        let lineCount = 0;
        let previousChunkEndedWithNewline = false;

        const stream = fs.createReadStream(filePath, { encoding: 'utf8' });

        stream.on('data', (chunk) => {
            if (previousChunkEndedWithNewline) {
                lineCount += chunk.split('\n').length;
            } else {
                lineCount += chunk.split('\n').length - 1;
            }
            previousChunkEndedWithNewline = chunk[chunk.length - 1] === '\n';
        });

        stream.on('end', () => {
            // If the last chunk ended without a newline, we need to add one more line
            if (!previousChunkEndedWithNewline) {
                lineCount++;
            }
            resolve(lineCount);
        });

        stream.on('error', (err) => {
            reject(err);
        });
    });
};

const processDirectory = async (dirPath) => {
    try {
        const files = fs.readdirSync(dirPath);

        for (const file of files) {
            const filePath = path.join(dirPath, file);

            if (fs.statSync(filePath).isDirectory()) {
                if (!excludedDirs.includes(file)) {
                    await processDirectory(filePath);
                }
            } else {
                if (!excludedFiles.includes(file)) {
                    const lines = await countLinesInFile(filePath);
                    console.log('Processed ' + filePath + ' Lines: ' + lines)
                    totalLines += lines;
                    totalFiles += 1;
                }
            }
        }
    } catch (err) {
        console.error('Error processing directory:', err);
    }
};

processDirectory(directoryPath).then(() => {
    console.log(`Total number of lines: ${totalLines}`);
    console.log(`Total number of files: ${totalFiles}`)
}).catch(err => {
    console.error('Error:', err);
});