const tgBotController = require('../tgBotController');
const sysController = require('../../core/systemController')
const path = require('path');

// Функция для определения типа файла на основе его расширения
const getFileType = (filename) => {
    const ext = path.extname(filename).toLowerCase();
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const videoExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.wmv'];

    if (imageExtensions.includes(ext)) return 'photo';
    if (videoExtensions.includes(ext)) return 'video';
    return 'document';
};

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Б';
    const k = 1024;
    const sizes = ['B', 'Kb', 'Mb', 'Gb'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const size = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
    return `${size} ${sizes[i]}`;
}

module.exports = async (bot, chatId, msgId, userdata, ...args) => {
    console.log(userdata)
    const postIdArg = args[0];
    const isDoc = args[1] === 'file';

    const parsePostIds = (arg) => {
        if (arg.includes('-')) {
            const [start, end] = arg.split('-').map(Number);
            let postIds;

            // Проверка порядка start и end и создание массива в нужном порядке
            if (start < end) {
                postIds = Array.from({ length: end - start + 1 }, (_, i) => start + i);
            } else {
                postIds = Array.from({ length: start - end + 1 }, (_, i) => start - i);
            }

            // Проверка на количество элементов в массиве
            if (postIds.length > 10) {
                tgBotController.sendMessage(chatId, 'No more that 10 posts allowed', msgId);
                return []
            }

            return postIds;
        }
        if (arg.includes(',')) {
            const postIds = arg.split(',').map(Number);
            // Проверка на количество элементов в массиве
            if (postIds.length > 10) {
                tgBotController.sendMessage(chatId, 'No more that 10 posts allowed', msgId);
                return []
            }
            return postIds;
        }

        const singlePostId = [Number(arg)];
        // Проверка на количество элементов в массиве
        if (singlePostId.length > 10) {
            tgBotController.sendMessage(chatId, 'No more that 10 posts allowed', msgId);
            return []
        }
        return singlePostId;
    };

    const postIds = parsePostIds(postIdArg);

    for (const postId of postIds) {
        const postData = await tgBotController.API('getPostData', chatId, { id: postId });

        const filePath = path.join(__dirname, `../../storage/file_storage/${postData.post.file}`);
        const fileType = getFileType(postData.post.file);
        let typeToSend = isDoc ? 'document' : fileType;

        if (postData.rslt == 'e') {
            await tgBotController.sendMessage(chatId, postData.msg, msgId);
            continue;
        }

        if (postData.rslt == 'w') {
            await tgBotController.sendMessage(chatId, `Post ${postId} is not present`, msgId);
            continue;
        }

        const postCapLines = []
        postCapLines.push(`<b><i>Post ${postData.post.id}</i></b>`)
        if (postData.post.description) postCapLines.push(`Post ${postData.post.id}`)
        postCapLines.push('Tags: ' + postData.post.tags.map(v => '<b>#' + v + '</b>').join(', '))
        postCapLines.push(`Post uploaded by <b><a href="http://vmtech.hopto.org:2000/profile/?user=${postData.post.author}">${postData.post.author}</a></b> via ${postData.post.file.split('-')[0]} on ${sysController.parseTimestamp(postData.post.timestamp)}`)
        postCapLines.push(`Size: ${postData.post.size.x}x${postData.post.size.y} (${formatFileSize(postData.post.size.weight)})`)
        postCapLines.push(`File format: ${postData.post.file.split('.').pop().toUpperCase()}`)

        if (postData.post.size.weight > 10485760 && typeToSend != 'document') {
            typeToSend = 'document'
            postCapLines.push(`<b><i>Upload made as file, file size exceeded 10Mb</i></b>`)
        }

        if (postData.post.size.weight > 52428800) {
            await tgBotController.sendMessage(chatId, 'File size ecxeeded 50Mb, upload canceled', msgId);
            return
        }

        const caption = postCapLines.join('\n\n')

        const postActions = []

        if (userdata.login == postData.post.author) {
            postActions.push({ text: 'Add post tags', data: `addTags:${postId}` })
        }

        const buttons = new tgBotController.inlineConstr(postActions)

        await tgBotController.useUtil('sendFile', chatId, null, [
            { type: typeToSend, media: filePath }
        ], {
            caption: caption,
            buttons: buttons.inline_keyboard,
            filename: `POST-${postData.post.id}${path.extname(postData.post.file)}`
        });
    }
};