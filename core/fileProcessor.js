const fs = require('fs')
const dbinteract = require('./DB/DBController.js')
const log = require('./consoleLogger')
const ffmpeg = require('fluent-ffmpeg')
const sharp = require('sharp')
const path = require('path')
const SysController = require('./systemController.js')
const Response = require('./responseConstructor.js')

module.exports = (filePath, sessionData) => {
    return new Promise(async resolve => {
        try {
            const fileSize = {
                x: 0,
                y: 0,
                weight: fs.statSync(filePath).size
            };

            const ext = path.extname(filePath).toLowerCase();

            const save_file_name = `${path.parse(filePath).name}`

            if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) {
                const metadata = await sharp(filePath).metadata();
                fileSize.x = metadata.width
                fileSize.y = metadata.height


                const dbuser = (await dbinteract.getUserBySessionData(sessionData.type, sessionData.key)).user.login
                const result = await dbinteract.createPost(save_file_name + ext, fileSize, dbuser);

                const systemTags = []

                switch (true) {
                    case fileSize.y > 2160: {
                        systemTags.push('absurd_res')
                    }; break
                    case fileSize.y > 1080: {
                        systemTags.push('high_res')
                    }; break;
                }

                switch (ext) {
                    case '.gif': {
                        systemTags.push('gif')
                    }; break;
                    default: {
                        systemTags.push('image')
                    }; break;
                }

                await dbinteract.updateTags(result.id, systemTags)

                if (result.rslt == 's') {
                    resolve(new Response(
                        's',
                        `Пост #${result.id} создан успешно`,
                        { postID: result.id }
                    ))
                } else {
                    resolve({ rslt: 's', msg: `Ошибка [fileProcessor]: ${result.msg}` })
                }
            } else if (['.mp4', '.mov', '.avi', '.mkv'].includes(ext)) {
                const videoPath = filePath;

                // Используем fluent-ffmpeg для получения информации о видео
                ffmpeg.ffprobe(videoPath, async (err, metadata) => {
                    if (err) {
                        log('e/Ошибка при выполнении ffprobe [fileProcessor][получение метаданных видео]: ' + err.message);
                        resolve({ rslt: 'e', msg: `Ошибка при выполнении ffprobe [fileProcessor][получение метаданных видео]: ${err.message}` })
                        return;
                    }

                    const width = metadata.streams[0].width;
                    const height = metadata.streams[0].height;


                    // Создаем превью из видео с помощью fluent-ffmpeg
                    const thumbnailPath = path.join(__dirname, '../storage/video_thumbnails');
                    const preview_result = await new Promise((resolve) => {
                        ffmpeg(videoPath)
                            .screenshots({
                                timestamps: ['1'], // Время захвата кадра
                                size: '?x200', // Размер миниатюры (высота 200 пикселей, ширина автоматически подстраивается)
                                count: 1, // Количество кадров для захвата
                                filename: 'THUMBFOR-' + save_file_name + '.jpg', // Имя файла превью
                                folder: thumbnailPath // Папка для сохранения превью
                            })
                            .on('end', () => {
                                resolve({ rslt: 's' });
                            })
                            .on('error', (err) => {
                                log(`e/Ошибка при выполнении ffmpeg [fileProcessor][создание превью]: ${err.message}`)
                                resolve({ rslt: 'e', msg: `Ошибка при выполнении ffmpeg [fileProcessor][создание превью]: ${err.message}` });
                            });
                    });

                    if (preview_result.rslt == 'e') {
                        resolve(preview_result)
                        return
                    }

                    // Сохраняем информацию о файле и создаем пост
                    fileSize.x = width
                    fileSize.y = height


                    const dbuser = (await dbinteract.getUserBySessionData(sessionData.type, sessionData.key)).user.login
                    const result = await dbinteract.createPost(save_file_name + ext, fileSize, dbuser);

                    const systemTags = []

                    switch (true) {
                        case fileSize.y > 2160: {
                            systemTags.push('absurd_res')
                        }; break
                        case fileSize.y > 1080: {
                            systemTags.push('high_res')
                        }; break;
                    }

                    const audioStreams = metadata.streams.filter(stream => stream.codec_type === 'audio');
                    const hasAudio = audioStreams.length > 0;
                    if(hasAudio){
                        systemTags.push('with_sound')
                    }

                    systemTags.push('video')

                    await dbinteract.updateTags(result.id, systemTags)

                    if (result.rslt == 's') {
                        resolve(new Response(
                            's',
                            `Пост #${result.id} создан успешно`,
                            { postID: result.id }
                        ))
                    } else {
                        resolve({ rslt: 's', msg: `Ошибка [fileProcessor]: ${result.msg}` })
                    }
                });
            } else {
                resolve({ rslt: 'e', msg: `Неподдерживаемый тип файла [fileProcessor] [${ext}]!` })
            }
        } catch (error) {
            resolve({ rslt: 'e', msg: `Ошибка при обработке файла [fileProcessor]: [${error}]!` })
        }
    })
}