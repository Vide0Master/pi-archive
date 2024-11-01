const tgBotController = require('../tgBotController');
const sysController = tgBotController.sysController;
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



module.exports = async (bot, chatId, msgId, userdata, ...args) => {
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

        if (postData.rslt == 'e') {
            await tgBotController.sendMessage(chatId, postData.msg, msgId);
            continue;
        }
        
        if (postData.rslt == 'w') {
            await tgBotController.sendMessage(chatId, `Post ${postId} is not present`, msgId);
            continue;
        }

        const filePath = path.join(__dirname, `../../storage/file_storage/${postData.post.file}`);
        const fileType = getFileType(postData.post.file);

        // Определяем тип отправляемого файла
        const typeToSend = isDoc ? 'document' : fileType;

        await tgBotController.useUtil('sendFile', chatId, null, [
            { type: typeToSend, media: filePath }
        ]);
    }
};
