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
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'Kb', 'Mb', 'Gb'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const size = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
    return `${size} ${sizes[i]}`;
}

module.exports = async (bot, chatId, msgId, userdata, ...args) => {
    const lpack = tgBotController.getUserLang(userdata)
    const postIdArg = args[0];
    const isDoc = args[1] === 'file';

    const parsePostIds = (arg) => {
        if (arg.includes('-')) {
            const [start, end] = arg.split('-').map(Number);
            let postIds;

            if (start < end) {
                postIds = Array.from({ length: end - start + 1 }, (_, i) => start + i);
            } else {
                postIds = Array.from({ length: start - end + 1 }, (_, i) => start - i);
            }

            if (postIds.length > 10) {
                tgBotController.sendMessage(chatId, lpack.post.postLimit, msgId);
                return []
            }

            return postIds;
        }
        if (arg.includes(',')) {
            const postIds = arg.split(',').map(Number);
            if (postIds.length > 10) {
                tgBotController.sendMessage(chatId, lpack.post.postLimit, msgId);
                return []
            }
            return postIds;
        }

        const singlePostId = [Number(arg)];
        if (singlePostId.length > 10) {
            tgBotController.sendMessage(chatId, lpack.post.postLimit, msgId);
            return []
        }
        return singlePostId;
    };

    if (!postIdArg) {
        tgBotController.sendMessage(chatId, lpack.post.noPostRequested, msgId)
        return
    }
    const postIds = parsePostIds(postIdArg);

    for (const postId of postIds) {
        const postData = await tgBotController.API('getPostData', chatId, { id: postId });

        if (postData.rslt == 'e') {
            await tgBotController.sendMessage(chatId, postData.msg, msgId);
            continue;
        }

        if (postData.rslt == 'w') {
            await tgBotController.sendMessage(chatId, `${lpack.post.postMissing[0]} ${postId} ${lpack.post.postMissing[1]}`, msgId);
            continue;
        }

        const filePath = path.join(__dirname, `../../storage/file_storage/${postData.post.file}`);
        const fileType = getFileType(postData.post.file);
        let typeToSend = isDoc ? 'document' : fileType;


        const postCapLines = []

        postCapLines.push(`<b><i>${lpack.post.postData.post} ${postData.post.id}</i></b>`)
        if (postData.post.description) postCapLines.push(`┣${lpack.post.postData.desc} ${postData.post.description}`)
        postCapLines.push(`${lpack.post.postData.tags}: ` + postData.post.tags
            .map(v => '<b>#' + v + '</b>')
            .map((v, i) => (i % 3 == 0 ? `\n║   ${v}` : v))
            .join(', '))

        postCapLines.push(`${lpack.post.postData.uploadedBy[0]} <b><a href="http://vmtech.hopto.org:2000/profile/?user=${postData.post.author}">${postData.post.author}</a></b>\n║   ${lpack.post.postData.uploadedBy[1]} ${postData.post.file.split('-')[0]} ${sysController.parseTimestamp(postData.post.timestamp)}`)
        postCapLines.push(`${lpack.post.postData.size}: ${postData.post.size.x}x${postData.post.size.y} (${formatFileSize(postData.post.size.weight)})`)
        postCapLines.push(`${lpack.post.postData.fileFormat}: ${postData.post.file.split('.').pop().toUpperCase()}`)

        if (postData.post.size.weight > 10485760 && typeToSend != 'document') {
            typeToSend = 'document'
            postCapLines.push(`<b><i>${lpack.post.postData.sizeOverflow}</i></b>`)
        }

        if (postData.post.size.weight > 52428800) {
            await tgBotController.sendMessage(chatId, lpack.post.fileSizeLimit, msgId);
            return new sysController.createResponse(
                'e',
                lpack.post.fileSizeLimit
            )
        }

        let caption = ''//postCapLines.join('\n\n')

        while (postCapLines.length > 0) {
            if (caption == '') {
                caption += '╔═ ' + postCapLines.shift() + '\n'
            } else if (postCapLines.length == 1) {
                caption += '╚═ ' + postCapLines.shift()
            } else {
                caption += '╠═ ' + postCapLines.shift() + '\n'
            }
        }

        const postActions = []

        if (userdata.login == postData.post.author || sysController.config.static.user_status[userdata.status] > 1) {
            postActions.push({ text: lpack.msgButtons.addPostTags, data: `addTags:${postId}` })
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

    return new sysController.createResponse(
        's',
        lpack.post.webResponse
    )
};
