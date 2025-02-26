const sysController = require('../core/systemController.js')
const cmd = (text) => { sysController.log(text, [{ txt: 'WEB', txtb: 'blue', txtc: 'yellow' }]) }
cmd('i/Starting WEB server...')

const express = require('express');
const bodyParser = require('body-parser');
const sassMiddleware = require('node-sass-middleware');

const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg')

const multer = require('multer');

const mime = require('mime-types');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './storage/file_storage');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `WEB-${sysController.hashGen(10)}-${Date.now()}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedImageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const allowedVideoExtensions = ['.mp4', '.mov', '.avi', '.mkv'];

    if (allowedImageExtensions.includes(ext)) {
        req.fileSizeLimit = 50 * 1024 * 1024;
    } else if (allowedVideoExtensions.includes(ext)) {
        req.fileSizeLimit = 1 * 1024 * 1024 * 1024;
    } else {
        return cb(new Error('Unsupported filetype'), false);
    }
    cb(null, true);
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
}).single('file')

const path = require('path');
const fs = require('fs')

const app = express();

app.get('/', (req, res) => {
    res.redirect('/welcome')
})

const pagesPath = path.join(__dirname, 'pages');
const globalFilesPath = path.join(__dirname, 'global_files');
fs.readdirSync(pagesPath).forEach(page => {
    const pagePath = path.join(pagesPath, page);
    app.use(`/${page}`, express.static(pagePath));
    app.use(`/${page}`, express.static(globalFilesPath));
    app.use(`/${page}`, sassMiddleware({
        src: pagePath,
        debug: false,
        outputStyle: 'compressed',
        prefix: '/',
        response: true,
        force: true,
    }));
    app.use(`/${page}`, sassMiddleware({
        src: globalFilesPath,
        debug: false,
        outputStyle: 'compressed',
        prefix: '/',
        response: true,
        force: true,
    }));
    app.get(`/${page}`, async (req, res) => {
        const indexPath = path.join(pagePath, 'index.html');
        res.sendFile(indexPath);
    });
})

app.use(`/lang`, express.static(path.join(__dirname, '../lang')))

app.use(express.json({ limit: '10mb' }));
app.use(bodyParser.json({ extended: true, limit: '10mb' }));
app.post('/api', async (req, res) => {
    await sysController.APIprocessorWEB(req, res)
})

const checkUserPermissionUpload = async (req, res, next) => {
    const userKey = req.headers['user-key'];
    if (!userKey) {
        return res.send('e/Access rejected.');
    }

    const userPermission = sysController.config.static.user_status[(await sysController.dbinteract.getUserBySessionData('WEB', userKey)).user.status]

    if (userPermission < 1) {
        return res.send('e/Access rejected.');
    } else {
        next();
    }
};

app.post('/upload', checkUserPermissionUpload, (req, res, next) => {
    upload(req, res, async () => {
        if (!req.file) {
            res.send('e/No file.');
            return
        }

        const fileResult = await sysController.fileProcessor(req.file.path, { type: "WEB", key: req.headers['user-key'] })
        res.send(JSON.stringify(fileResult));
    })
})

app.get('/file', async (req, res) => {
    const tempKey = req.query.tempKey;
    const postID = req.query.id;
    const userKey = req.query.userKey;
    const generateThumbnail = req.query.thumb === 'true';
    const heightQuery = parseInt(req.query.h);
    const fileCacheTTL = 604800;

    let user_perm = 0;

    if (!userKey) {
        if (tempKey) {
            const tempKeyCheck = await sysController.dbinteract.getTempKeyData(tempKey);

            if (tempKeyCheck.rslt === 'e') {
                return res.status(500).send('<h1>500</h1>Server error!');
            }

            if (!tempKeyCheck.data) {
                return res.status(403).send('<h1>403</h1>Access rejected!<br>Access key expired.');
            }

            const tempKeyData = tempKeyCheck.data;

            if (tempKeyData.postID != postID) {
                return res.status(403).send(`<h1>403</h1>Access rejected!<br>Access key does not match post ID:${postID}.`);
            }

            if (tempKeyData.expires !== 'infinite' && tempKeyData.expires < Date.now()) {
                await sysController.dbinteract.deleteExpiredTempKey(tempKeyData.key);
                return res.status(403).send('<h1>403</h1>Access rejected!<br>Access key expired.');
            }

            user_perm = 1;
        }
    } else {
        const userData = await sysController.dbinteract.getUserBySessionData('WEB', userKey);
        if (userData.rslt === 's') {
            user_perm = sysController.config.static.user_status[userData.user.status];
        }
    }

    if (user_perm < 1) {
        return res.status(403).send('<h1>403</h1>Access rejected!');
    }

    const postData = await sysController.dbinteract.getPostData(postID);
    if (postData.rslt === 'e') {
        return res.status(500).send('<h1>500</h1>Server error: ' + postData.msg);
    }
    if (!postData.post) {
        return res.status(404).send(`<h1>404</h1>Post <b>${postID}</b> not found in DB!`);
    }
    const file = postData.post.file;

    if (!file) {
        return res.status(500).send('<h1>500</h1>Record data missing!\nReport to admin ASAP!');
    }

    const filepath = path.join(__dirname, '../storage/file_storage', file);
    if (!fs.existsSync(filepath)) {
        return res.status(404).send('<h1>404</h1>File not found!');
    }

    let mimeType = mime.lookup(filepath);

    const fileCacheKey = generateThumbnail
        ? `thumb@${filepath}`
        : heightQuery
            ? `h${heightQuery}@${filepath}`
            : `full@${filepath}`;


    const isImage = mimeType.startsWith('image/');
    const isVideo = mimeType.startsWith('video/');
    const originalHeight = JSON.parse(postData.post.size).y;

    if (sysController.fileCacheController.checkAvailabilty(fileCacheKey)) {
        const cachedFile = sysController.fileCacheController.getRecordData(fileCacheKey);
        const fileSize = cachedFile.length;

        const isThumbnail = fileCacheKey.startsWith('thumb@');
        const isResized = fileCacheKey.startsWith('h')
        const responseMimeType = isThumbnail || isResized ? 'image/jpeg' : mimeType

        const range = req.headers.range;

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

            if (start >= fileSize || end >= fileSize) {
                return res.status(416).send('Requested range not satisfiable\n' + start + ' >= ' + fileSize);
            }

            const chunk = cachedFile.slice(start, end + 1);
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunk.length,
                'Content-Type': responseMimeType,
                'Cache-Control': `public, max-age=${fileCacheTTL}`,
                'ETag': `"${fileCacheKey}-${fileSize}"`,
            };

            res.writeHead(206, head);
            return res.end(chunk);
        } else {
            res.setHeader('Content-Type', responseMimeType);
            res.setHeader('Cache-Control', `public, max-age=${fileCacheTTL}`);
            res.setHeader('ETag', `"${fileCacheKey}-${fileSize}"`);
            return res.end(cachedFile);
        }
    }

    let processedFileBuffer;

    const fileBuffer = fs.readFileSync(filepath);

    let needsProcessing = false;
    let targetHeight = null;

    if (generateThumbnail) {
        needsProcessing = true;
        targetHeight = 200;
        if (isVideo) {
            if (200 > originalHeight) {
                targetHeight = originalHeight
            }
        }
    } else if (heightQuery) {
        needsProcessing = true;
        if (isImage) {
            targetHeight = heightQuery;
        } else if (isVideo) {
            if (heightQuery < originalHeight) {
                targetHeight = heightQuery
            } else {
                targetHeight = originalHeight
            }
        } else {
            return res.status(400).send('<h1>400</h1>Height queries only supported for images');
        }
    }

    if (needsProcessing) {
        try {
            if (isImage) {
                processedFileBuffer = await sharp(fileBuffer)
                    .resize({ height: targetHeight, fit: 'inside' })
                    .toBuffer();
            }
            else if (isVideo) {
                processedFileBuffer = await new Promise((resolve, reject) => {
                    const buffers = [];

                    const ffmpegProcess = ffmpeg(filepath)
                        .inputOptions('-ss 1')
                        .videoFilters(`scale=-1:${targetHeight}`)
                        .outputOptions('-vframes 1')
                        .outputOptions('-c:v mjpeg')
                        .outputFormat('image2pipe')
                        .on('error', (err) => {
                            console.error('FFmpeg error:', err);
                            reject(new Error(`FFmpeg error: ${err.message}`));
                        })
                        .on('end', () => {
                            if (buffers.length === 0) {
                                reject(new Error('Empty video thumbnail generated'));
                                return;
                            }
                            resolve(Buffer.concat(buffers));
                        });

                    ffmpegProcess.pipe()
                        .on('data', (chunk) => buffers.push(chunk))
                        .on('error', (err) => {
                            console.error('Stream error:', err);
                            reject(new Error(`Stream error: ${err.message}`));
                        });
                });

                mimeType = 'image/jpeg';
            }
        } catch (e) {
            const errorType = isImage ? 'image' : 'video';
            cmd(`e/Failed to process ${errorType} for ${filepath}: ${e}`);
            return res.status(500).send(
                `<h1>500</h1>${generateThumbnail ? 'Preview' : 'Resize'} failed for ${errorType}!` +
                `\nError: ${e.message}`
            );
        }
    } else {
        processedFileBuffer = fileBuffer;
    }

    if (processedFileBuffer.length === 0) {
        cmd(`e/Empty buffer generated for ${filepath}`);
        return res.status(500).send('<h1>500</h1>Failed to generate preview');
    }

    sysController.fileCacheController.createRecord(fileCacheKey, processedFileBuffer, 170);

    const fileSize = processedFileBuffer.length;
    const range = req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        if (start >= fileSize || end >= fileSize) {
            return res.status(416).send('Requested range not satisfiable\n' + start + ' >= ' + fileSize);
        }

        const chunk = processedFileBuffer.subarray(start, end + 1);
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunk.length,
            'Content-Type': mimeType,
            'Cache-Control': `public, max-age=${fileCacheTTL}`,
            'ETag': `"${fileCacheKey}-${fileSize}"`,
        };

        res.writeHead(206, head);
        res.end(chunk);
    } else {
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Cache-Control', `public, max-age=${fileCacheTTL}`);
        res.setHeader('ETag', `"${fileCacheKey}-${fileSize}"`);
        res.end(processedFileBuffer);
    }
});

app.use(`/eula`, express.static(globalFilesPath));
app.get('/eula', async (req, res) => {
    res.sendFile(path.join(__dirname, './eula.html'))
})

const http = require('http');
const WebSocket = require('ws');
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

sysController.WSS.WSS = wss
wss.on('connection', (ws) => {
    ws.on('message', (msg) => {
        const request = JSON.parse(msg.toString())
        sysController.WSS.pocessRequest(ws, request.type, request.user, request.data)
    })
})

server.listen(sysController.config.static.web_app.port, () => {
    cmd('s/WEB server started succesfully!')
    cmd(`i/Listening HTTP and WS connections on port [${sysController.config.static.web_app.port}]`)
});

sysController.dbinteract.AUDITPosts()

