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
            const ext = path.extname(filePath).toLowerCase();
            const save_file_name = path.parse(filePath).name;
            let finalVideoPath = filePath; // Исходный путь (может измениться после конвертации)

            if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) {
                const metadata = await sharp(filePath).metadata();
                const fileSize = { x: metadata.width, y: metadata.height, weight: fs.statSync(filePath).size };

                const dbuser = (await dbinteract.getUserBySessionData(sessionData.type, sessionData.key)).user.login;
                const result = await dbinteract.createPost(save_file_name + ext, fileSize, dbuser);

                const systemTags = [];
                if (fileSize.y >= 2160) systemTags.push('absurd_res');
                else if (fileSize.y >= 1080) systemTags.push('high_res');
                systemTags.push(ext === '.gif' ? 'gif' : 'image');

                await dbinteract.updateTags(result.id, systemTags);
                resolve(result.rslt === 's'
                    ? new Response('s', `Post #${result.id} created`, { postID: result.id })
                    : { rslt: 's', msg: `Error: ${result.msg}` });
                return;
            }

            if (['.mp3', '.ogg', '.wav', '.flac'].includes(ext)) {
                const mm = require('music-metadata');
                const metadata = await mm.parseFile(filePath);
                const stats = fs.statSync(filePath);

                const fileInfo = {
                    duration: metadata.format.duration,
                    bitrate: metadata.format.bitrate,
                    weight: stats.size
                };

                const dbuser = (await dbinteract.getUserBySessionData(sessionData.type, sessionData.key)).user.login;
                const result = await dbinteract.createPost(save_file_name + ext, fileInfo, dbuser);

                const systemTags = ['audio'];
                if (fileInfo.bitrate >= 192000) systemTags.push('high_quality');
                if (metadata.common.genre) systemTags.push(...metadata.common.genre.split(/\s*,\s*/));

                await dbinteract.updateTags(result.id, systemTags);
                resolve(result.rslt === 's'
                    ? new Response('s', `Audio Post #${result.id} created`, { postID: result.id })
                    : { rslt: 's', msg: `Error: ${result.msg}` });

                return;
            }

            if (!['.mp4', '.mov', '.avi', '.mkv'].includes(ext)) {
                resolve({ rslt: 'e', msg: `Unsupported filetype [${ext}]!` });
                return;
            }

            ffmpeg.ffprobe(filePath, async (err, metadata) => {
                if (err) {
                    log('e/Error executing FFMPEG [metadata]: ' + err.message);
                    resolve({ rslt: 'e', msg: `Error executing FFMPEG[metadata]: ${err.message}` });
                    return;
                }

                const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
                const audioStream = metadata.streams.find(stream => stream.codec_type === 'audio');
                const isMp4 = ext === '.mp4';
                const needsConversion = !isMp4 || videoStream.codec_name !== 'h264' || (audioStream && audioStream.codec_name !== 'aac');

                if (needsConversion) {
                    const tempPath = path.join(path.dirname(filePath), `${save_file_name}-temp.mp4`);
                    await new Promise((resolveConvert, rejectConvert) => {
                        ffmpeg(filePath)
                            .output(tempPath)
                            .videoCodec('libx264')
                            .audioCodec('aac')
                            .audioChannels(2)
                            .format('mp4')
                            .outputOptions('-movflags +faststart')
                            .on('end', () => {
                                log(`s/Video converted: ${tempPath}`);
                                fs.unlinkSync(filePath);
                                fs.renameSync(tempPath, filePath);
                                finalVideoPath = filePath;
                                resolveConvert();
                            })
                            .on('error', (err) => {
                                log(`e/Error converting video: ${err.message}`);
                                rejectConvert(err);
                            })
                            .run();
                    });

                    metadata = await new Promise((resolveMeta, rejectMeta) => {
                        ffmpeg.ffprobe(finalVideoPath, (err, newMeta) => {
                            if (err) {
                                rejectMeta(err);
                            } else {
                                resolveMeta(newMeta);
                            }
                        });
                    });
                }

                const updatedVideoStream = metadata.streams.find(stream => stream.codec_type === 'video');
                const updatedAudioStream = metadata.streams.find(stream => stream.codec_type === 'audio');

                const fileSize = {
                    x: updatedVideoStream.width,
                    y: updatedVideoStream.height,
                    duration: metadata.format.duration,
                    weight: fs.statSync(finalVideoPath).size
                };

                const dbuser = (await dbinteract.getUserBySessionData(sessionData.type, sessionData.key)).user.login;
                const result = await dbinteract.createPost(save_file_name + '.mp4', fileSize, dbuser);

                const systemTags = [];
                if (fileSize.y >= 2160) systemTags.push('absurd_res');
                else if (fileSize.y >= 1080) systemTags.push('high_res');
                if (updatedAudioStream) systemTags.push('with_sound');
                systemTags.push('video');

                await dbinteract.updateTags(result.id, systemTags);

                resolve(result.rslt === 's'
                    ? new Response('s', `Post #${result.id} created`, { postID: result.id })
                    : { rslt: 's', msg: `Error while processing file: ${result.msg}` });
            });
        } catch (error) {
            resolve({ rslt: 'e', msg: `Error while processing file: [${error}]!` });
        }
    });
};
