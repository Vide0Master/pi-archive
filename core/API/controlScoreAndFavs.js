const sysController = require('../systemController')

//экспорт функции
module.exports = (request, userData) => {
    return new Promise(async resolve => {
        switch (request.type) {
            case 'setLike': {
                if (userData.likes.includes(request.postID)) {
                    resolve(new sysController.createResponse(
                        'e',
                        'Ты особенный?'
                    ))
                } else {
                    userData.likes.push(request.postID)
                    const likes_result = await sysController.dbinteract.updateUserLikes(userData.likes, userData.login)
                    resolve(likes_result)
                }
            }; break;
            case 'removeLike': {
                if (!userData.likes.includes(request.postID)) {
                    resolve(new sysController.createResponse(
                        'e',
                        'Ты особенный?'
                    ))
                } else {
                    const likes_result = await sysController.dbinteract.updateUserLikes(userData.likes.filter(element => element != request.postID), userData.login)
                    resolve(likes_result)
                }
            }; break;
            case 'setDislike': {
                if (userData.dislikes.includes(request.postID)) {
                    resolve(new sysController.createResponse(
                        'e',
                        'Ты особенный?'
                    ))
                } else {
                    userData.dislikes.push(request.postID)
                    const dislikes_result = await sysController.dbinteract.updateUserDislikes(userData.dislikes, userData.login)
                    resolve(dislikes_result)
                }
            }; break;
            case 'removeDislike': {
                if (!userData.dislikes.includes(request.postID)) {
                    resolve(new sysController.createResponse(
                        'e',
                        'Ты особенный?'
                    ))
                } else {
                    const dislikes_result = await sysController.dbinteract.updateUserDislikes(userData.dislikes.filter(element => element != request.postID), userData.login)
                    resolve(dislikes_result)
                }
            }; break;
            case 'addFavourite': {
                if (userData.favs.includes(request.postID)) {
                    resolve(new sysController.createResponse(
                        'e',
                        'Ты особенный?'
                    ))
                } else {
                    userData.favs.push(request.postID)
                    const favs_result = await sysController.dbinteract.updateUserFavs(userData.favs, userData.login)
                    resolve(favs_result)
                }
            }; break;
            case 'removeFavourite': {
                if (!userData.favs.includes(request.postID)) {
                    resolve(new sysController.createResponse(
                        'e',
                        'Ты особенный?'
                    ))
                } else {
                    const favs_result = await sysController.dbinteract.updateUserFavs(userData.favs.filter(element => element != request.postID), userData.login)
                    resolve(favs_result)
                }
            }; break;
            case 'getUserInfo': {
                resolve(new sysController.createResponse(
                    's',
                    'Получены данные пользователя',
                    {
                        likes: userData.likes,
                        dislikes: userData.dislikes,
                        favs: userData.favs,
                    }
                ))
            }; break;
            case 'getPostScore': {
                const data = await sysController.dbinteract.getPostLikesDislikesFavs(request.postID)
                resolve(data)
            }; break;
        }
    })
}