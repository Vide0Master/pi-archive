// Импорт
const sysController = require('../core/systemController.js')

const express = require('express');
const bodyParser = require('body-parser');
const sassMiddleware = require('node-sass-middleware');

const sharp = require('sharp');

const multer = require('multer');

const mime = require('mime-types');

// Настройка хранилища multer для сохранения файлов с их оригинальными расширениями
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './storage/file_storage');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `WEB-${sysController.hashGen(10)}-${Date.now()}${ext}`);
    }
});

// Функция для проверки размера файла в зависимости от его типа
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) {
        req.fileSizeLimit = 50 * 1024 * 1024; // 50 MB для фото
    } else if (['.mp4', '.mov', '.avi', '.mkv'].includes(ext)) {
        req.fileSizeLimit = 1 * 1024 * 1024 * 1024; // 1 GB для видео
    } else {
        req.fileSizeLimit = 10 * 1024 * 1024; // 10 MB по умолчанию
    }
    cb(null, true);
};

// Middleware для настройки ограничения размера файла
const upload = multer({
    storage: storage,
    fileFilter: fileFilter
}).single('file')

const path = require('path');
const fs = require('fs')

// Модуль веб-страницы
sysController.log('i/Запуск веб страницы')

const app = express();

app.get('/', (req, res) => {
    res.redirect('/welcome')
})

// прогрузка страниц
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

//слушатель post запросов
app.use(express.json({ limit: '10mb' }));
app.use(bodyParser.json({ extended: true, limit: '10mb' }));
app.post('/api', async (req, res) => {
    await sysController.APIprocessorWEB(req, res)
})

// Middleware для проверки пользовательского ключа и уровня доступа
const checkUserPermissionUpload = (req, res, next) => {
    const userKey = req.headers['user-key'];
    if (!userKey) {
        return res.send('e/Отказано в доступе.');
    }

    const userPermission = sysController.dbinteract.getUserPermission(userKey);
    if (userPermission < 1) {
        return res.send('e/Отказано в доступе.');
    } else {
        next();
    }
};

//middleware для загрузки файлов от пользователя
app.post('/upload', checkUserPermissionUpload, (req, res, next) => {
    upload(req, res, async () => {
        if (!req.file) {
            res.send('w/Нет файла для загрузки.');
            return
        }

        const fileResult = await sysController.fileProcessor(req.file.path, req.headers['user-key'])
        res.send(JSON.stringify(fileResult));
    })
})

// путь для передачи файлов с проверкой пользовтеля
app.get('/file', async (req, res) => {

    const tempKey = req.query.tempKey;
    const postID = req.query.id;
    const userKey = req.query.userKey;

    let user_perm = 0;

    // If userKey is provided, ignore temporary key processing
    if (!userKey) {
        if (tempKey) {
            const tempKeyCheck = await sysController.dbinteract.getTempKeyData(tempKey);

            if (tempKeyCheck.rslt === 'e') {
                return res.status(500).send('<h1>500</h1>Ошибка сервера!');
            }

            if (!tempKeyCheck.data) {
                return res.status(403).send('<h1>403</h1>Отказано в доступе!<br>Истёк срок службы ключа.');
            }

            const tempKeyData = tempKeyCheck.data;

            if (tempKeyData.postID != postID) {
                return res.status(403).send(`<h1>403</h1>Отказано в доступе!<br>Ключ не принадлежит посту ID:${postID}.`);
            }

            if (tempKeyData.expires !== 'infinite' && tempKeyData.expires < Date.now()) {
                await sysController.dbinteract.deleteExpiredTempKey(tempKeyData.key);
                return res.status(403).send('<h1>403</h1>Отказано в доступе!<br>Истёк срок службы ключа.');
            }

            user_perm = 1;
        }
    } else {
        user_perm = await sysController.dbinteract.getUserPermission(userKey);
    }

    if (user_perm < 1) {
        return res.status(403).send('<h1>403</h1>Отказано в доступе!');
    }

    if (user_perm == 'e') {
        return res.status(500).send('<h1>500</h1>Ошибка сервера!');
    }

    const file = await sysController.dbinteract.getFileNameByPostID(postID);

    if (!file) {
        return res.status(500).send('<h1>500</h1>Запись о файле утеряна!\nСрочно сообщите администратору!');
    }

    if (file.rslt === 'e') {
        return res.status(file.code).send(`<h1>${file.code}</h1>` + file.msg);
    }

    const filepath = path.join(__dirname, '../storage/file_storage', file);
    const range = req.headers.range;
    const mimeType = mime.lookup(filepath);

    // Проверка параметра thumb
    const generateThumbnail = (req.query.thumb === 'true' && !tempKey);

    if (generateThumbnail) {
        if (mimeType.startsWith('image/')) {
            // Изменение размера изображения
            const resizedImage = await sharp(filepath)
                .resize({ height: 200, fit: 'inside' })
                .toBuffer();
            res.set('Content-Type', mimeType);
            res.send(resizedImage);
        } else if (mimeType.startsWith('video/')) {
            const thumbnailPath = path.join(__dirname, '../storage/video_thumbnails', `THUMBFOR-${path.parse(filepath).name}.jpg`);

            if (fs.existsSync(thumbnailPath)) {
                res.sendFile(thumbnailPath);
            } else {
                res.status(404).send('<h1>404</h1>Миниатюра видео не найдена!');
            }
        } else {
            res.status(400).send('<h1>400</h1>Неподдерживаемый тип файла для миниатюры!');
        }
        return;
    }

    if (range) {
        const stat = fs.statSync(filepath);
        const fileSize = stat.size;
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        if (start >= fileSize || end >= fileSize) {
            return res.status(416).send('Requested range not satisfiable\n' + start + ' >= ' + fileSize);
        }

        const chunksize = (end - start) + 1;
        const fileStream = fs.createReadStream(filepath, { start, end });
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': mimeType,
        };

        res.writeHead(206, head);

        fileStream.pipe(res);
    } else {
        res.sendFile(filepath,()=>{});
    }
});

//Запуск слушателя на порту из config.json
app.listen(sysController.config.static.web_app.port, () => {
    sysController.log('s/Веб страница запущена успешно')
});

sysController.dbinteract.AUDITPosts()