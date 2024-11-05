const tgBotController = require('../tgBotController');

const helpMessage = [
    'You need help? Here i am!',
    `Confronted error or found a bug? Something is wrong?\nBe kind and fill and issue on <b>Pi-Archive's <a href="https://github.com/Vide0Master/pi-archive">GitHub</a>!</b>\nProvide as much information as you can: detailed description, screenshots, steps to reproduce.`,
    `Here are the list of commands:
/help -- Calls this information. (Adding FAQ after /help will display frequently asked questions)
/login <code>username</code> <code>password</code> -- logs you into your account.
/unlogin -- unlogs you from your account.
/post <code>post ID</code> / <code>range start - range end</code> / <code>ID,ID,ID</code> -- lets you get post from archive by it's ID
/addTags <code>post ID</code> -- sends message, after which you need to write additional desired tags. (wider functionality available on website)`,
    `If you want to send image / video / gif to Archive, simply send it to me! But you need to be logged in first, to be able to do that.`
]

const FAQ = [
    {
        q: `Is this Gelbooru ?`,
        a: `No it is not! This is absolutely separate thing! and this system is developed by me, using only little amount of program libraries but not whole engines that postboards like Gelbooru runs on.
All stuff here developed by one crazy developer - @vide0master. I try to implement stuff that are not present in any of other postboards available.`
    },
    {
        q: `Where are other features?`,
        a: `Delayed, there are too many issues with archive at the moment.`
    },
    {
        q: `When do features release?`,
        a: `When they are done and tested to be as reliable for user as they can be.`
    },
    {
        q: `Can i help somehow?`,
        a: `Report any issues to <b><a href="https://github.com/Vide0Master/pi-archive">GitHub</a></b>, it's the best thing you can do.`
    },
    {
        q: `Can i ask something on GitHub?`,
        a: `Of course you can! i will try to answer anything that would be questioned there.`
    },
    {
        q: `Is there any limits for something?`,
        a: `Moral limits is described within <b><a href="http://vmtech.hopto.org:2000/eula">EULA</a></b>.
Also there are limits for TG bot which are: 20Mb upload, 10Mb to download image/video, 50Mb for downloading post as file.
Other limitations will be designated in future and is subject to change over time, based on laws, needs and capabilities.`
    },
    {
        q: `Is there any issues with app at whole?`,
        a: `Of course there is. Archive is not made super-tough to different types of attacs. All i can say - use the app for your needs, not for harm, share peace and love with each other.`
    },
    {
        q: `Is my data safe?`,
        a: `Yes. At least all user passwords stored in hash variants, which means that even I as developer can't see your passwords. Other data is not so sensitive so doesn't need to be cyphered or heavily protected.`
    },
    {
        q: `My question is not here!`,
        a: `Ask me personally on <b><a href="https://github.com/Vide0Master/pi-archive/issues">GitHub</a></b>, I will respond when i can.`
    }
]

module.exports = async (bot, chatId, msgId, userdata , help = '') => {
    if (help.toUpperCase() == 'FAQ') {
        await tgBotController.sendMessage(chatId, '<b><i>Frequently asked questions</i></b>', msgId)
        for (const msg of FAQ) {
            await tgBotController.sendMessage(
                chatId,
                `<b><i>Q:</i></b> ${msg.q}\n\n<b><i>A:</i></b> ${msg.a}`
            )
        }
        return
    }
    if(userdata){
        await tgBotController.sendMessage(chatId, `Hello ${userdata.username}!\n\n` + helpMessage.join('\n\n'), msgId)
    }else{
        await tgBotController.sendMessage(chatId, `Hello newcomer!\n\n` + helpMessage.join('\n\n'), msgId)
    }
};
