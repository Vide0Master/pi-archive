const webSocket = new WebSocket(`wss://${window.location.host}`);

webSocket.addEventListener('open', () => {
    if (DEVMODE) {
        console.log(`WebSocket server(ws://${window.location.host}) connected`);
    }
    WSSend('CT')
});

if (DEVMODE) {
    webSocket.addEventListener('close', () => {
        console.log('WebSocket connection closed');
    });

    webSocket.addEventListener('error', (error) => {
        console.error('WebSocket error:', error);
    });
}

function WSListener(type, target, cb) {
    webSocket.addEventListener('message', (msg) => {
        const WSmsg = JSON.parse(msg.data)
        if (WSmsg.type == type && WSmsg.target == target) cb(WSmsg.data)
    })
}

function WSSend(type, data) {
    const request = {
        type,
        user: {
            key: localStorage.getItem('userKey') || sessionStorage.getItem('userKey'),
            type: 'WEB'
        },
        data
    }
    webSocket.send(JSON.stringify(request));
}

if (localStorage.getItem('userKey') || sessionStorage.getItem('userKey')) setHeaderButtons()

if (localStorage.getItem('showIntro') == null) localStorage.setItem('showIntro', true)

function tryIntro() {
    if (['/welcome/', '/login/', '/register/'].includes(window.location.pathname)) return

    const html = document.querySelector('html')
    html.style.overflow = 'hidden'
    const container = createDiv('intro-overlay', document.querySelector('body'))

    const mainLabelCont = createDiv('main-label-cont', container)

    const piImg = document.createElement('img')
    piImg.src = 'icons/Pi-symbol.svg'
    piImg.className = 'pi-logo'
    mainLabelCont.appendChild(piImg)

    const labelText = createDiv('label-text', mainLabelCont)
    labelText.innerHTML = 'Archive'

    const vmTechLabelCont = createDiv('vmtech-label-cont', container)

    createDiv('by-text', vmTechLabelCont).innerHTML = Language.intro.by + " "
    createDiv('spacer', vmTechLabelCont)
    const vSymb = createDiv('V', vmTechLabelCont)
    vSymb.innerHTML = 'V'
    createDiv('ideo', vSymb).innerHTML = 'ideo'
    const mSymb = createDiv('M', vmTechLabelCont)
    mSymb.innerHTML = 'M'
    createDiv('spacer', vmTechLabelCont).style.animation = 'spacerShrink 1.5s ease-in 3.5s forwards'
    createDiv('aster', mSymb).innerHTML = 'aster '
    const TECH = createDiv('TECH', vmTechLabelCont)
    TECH.innerHTML = 'Tech'
    createDiv('nologies', TECH).innerHTML = 'nologies'

    container.addEventListener('animationend', (e) => {
        if (e.target != container) return
        html.removeAttribute('style')
        container.remove()
        localStorage.setItem('introComplete', Date.now())

        tryCelebration()
    })
}

if (localStorage.getItem('showIntro') === 'true') {
    if (parseInt(localStorage.getItem('introComplete')) > Date.now() - 1000 * 60 * 60 * 6) {
        localStorage.setItem('introComplete', Date.now())
        tryCelebration()
    } else {
        tryIntro()
    }
} else {
    tryCelebration()
}

//region head buttons
async function setHeaderButtons() {
    const headerLang = Language.header
    const user_acc = await request('AuthyPageAccessCheck', {
        page: window.location.pathname.replace(/\//g, ''),
        userKey: localStorage.getItem('userKey') || sessionStorage.getItem('userKey')
    })

    createSearchField(document.querySelector('header'))

    const pages = [
        { name: headerLang[5], link: '/collection', restr: 1, icon: `icons/collections-icon.svg` },
        { name: headerLang[1], link: '/post', restr: 1, icon: `icons/upload-icon.svg` },
        { name: headerLang[3], link: '/messages', restr: 1 },
        { name: headerLang[2], link: '/profile', restr: 1 },
        { name: headerLang[4], link: '/admin', restr: 2, icon: `icons/admin-wrench.svg` }
    ]

    const navigator = createDiv('nav-row', document.querySelector('header'))

    for (const page of pages) {
        if (page.restr <= user_acc.perm_level) {
            const link = createAction(page.name, navigator, null, page.icon)
            link.className = page.link.substring(1)
            link.href = page.link
        }
    }

    getMessageCount()

    setUserAvatarInHeader()
}

async function setUserAvatarInHeader() {
    const userData = await request('getUserProfileData', {})
    if (userData.data.usersettings.ProfileAvatarPostID) {
        const avatarContainer = createDiv('avatar-cont')
        document.querySelector('.nav-row .profile').insertAdjacentElement('afterbegin', avatarContainer)
        createUserAvatarElem(userData.data.usersettings.ProfileAvatarPostID, avatarContainer, false, 50)
    }
}

function createSearchField(parent) {
    const rowCont = createDiv('search-row', parent)

    const inputElem = document.createElement('input')
    inputElem.id = 'taglist'
    inputElem.setAttribute('autocomplete', 'off')
    rowCont.appendChild(inputElem)
    inputElem.placeholder = Language.header[0]

    inputElem.value = new URLSearchParams(window.location.search).get('tags')

    const searchBtn = createDiv('search-button', rowCont)
    searchBtn.addEventListener('click', () => {
        search(inputElem.value)
    })

    addTagsAutofill(inputElem, rowCont)

    return rowCont
}

if (localStorage.getItem('EXPERIMENT_invertHeaderBar') == 'true') {
    const header = document.querySelector('.norma-page-container header')
    header.style.flexDirection = 'row-reverse'
}

if (localStorage.getItem('EXPERIMENT_invertHeaderList') == 'true') {
    document.querySelector('.norma-page-container header .nav-row').style.flexDirection = 'row-reverse'
}

if (localStorage.getItem('EXPERIMENT_splitHeaderBar') == 'true') {
    document.querySelector('.norma-page-container header').style.justifyContent = 'space-between'
}

//region tag autofill
async function addTagsAutofill(field, parent, preventSearch = false) {
    const autocomplete = createDiv('autocomplete', parent)
    autocomplete.style.display = 'none'
    let selector = []
    let selPos = -1

    function getCursorWordIndex(field) {
        const cursorPos = field.selectionStart;
        const value = field.value;
        const parts = value.split(' ');

        let startPos = 0;
        for (let i = 0; i < parts.length; i++) {
            const word = parts[i];
            if (cursorPos >= startPos && cursorPos <= startPos + word.length) {
                return i;
            }
            startPos += word.length + 1;
        }
        return -1;
    }

    async function process(e) {
        const parts = field.value.split(' ');
        const cursorWordIndex = getCursorWordIndex(field);
        const targetWord = parts[cursorWordIndex];

        let lastPart = targetWord;
        if (targetWord[0] == '-') {
            lastPart = lastPart.substring(1);
        }

        function setField() {
            parts[cursorWordIndex] = selector[selPos].tag;
            if (targetWord[0] == '-') {
                parts[cursorWordIndex] = "-" + parts[cursorWordIndex];
            }
            field.value = parts.join(' ');
            autocomplete.style.display = 'none';
            selPos = -1;
            selector = [];
        }

        if (e.code == "Enter") {
            if (selPos > -1) {
                setField()
                return
            } else {
                if (!preventSearch) {
                    search(field.value)
                }
            }
        }

        if (lastPart.length >= 2) {
            let rst = false
            switch (e.code) {
                case "ArrowUp": {
                    e.preventDefault()
                    if (selPos > 0) {
                        selPos -= 1
                    }
                    rst = true
                }; break;
                case "ArrowDown": {
                    e.preventDefault()
                    if (selPos < selector.length - 1) {
                        selPos += 1
                    }
                    rst = true
                }; break;
            }
            for (const elm of selector) {
                elm.elem.classList.remove('active')
            }
            if (selPos >= 0 && selPos < selector.length)
                selector[selPos].elem.classList.add('active')
            if (rst)
                return

            const listRslt = await request('getTagsAutocomplete', { tagPart: lastPart })
            if (listRslt.rslt == 'e') {
                alert(listRslt.rslt + "/" + listRslt.msg)
                return
            }
            if (listRslt.tags.length == 0) {
                autocomplete.style.display = 'none'
                autocomplete.innerHTML = ''
                return
            }

            selector = []
            selPos = -1
            autocomplete.removeAttribute('style')
            autocomplete.innerHTML = ''

            let i = 0
            for (const tag of listRslt.tags) {
                const tagContainer = createDiv('tagContainer', autocomplete)
                const tagElem = createTagline(tag, { s: false, tedit: false })
                tagContainer.appendChild(tagElem)
                selector.push({
                    tag: tag.tag,
                    elem: tagElem
                })
                tagElem.addEventListener('mousedown', () => {
                    selPos = i++
                    setField()
                })
            }

        } else {
            autocomplete.style.display = 'none'
        }
    }

    field.addEventListener('keydown', (e) => {
        process(e)
    })
    field.addEventListener('input', (e) => {
        process(e)
    })
    field.addEventListener('click', (e) => {
        process(e)
    })
    field.addEventListener('focusout', () => {
        autocomplete.style.display = 'none'
    })
    field.addEventListener('focusin', () => {
        if (autocomplete.innerHTML != '') {
            autocomplete.removeAttribute('style')
        }
    })
}

//region cr action
function createAction(name, parentElement, cb, iconLink) {
    const action = document.createElement('a');
    if (parentElement) parentElement.appendChild(action);
    if (cb) action.addEventListener('click', cb);

    if (iconLink) {
        const icon = createDiv('action-icon', action)
        icon.style = `--action-icon-link:url(${iconLink})`
    }

    createDiv('action-label', action).innerText = name;

    return action
}

//region cr Pcard
function createPostCard(postData, noClickReaction) {

    const fileExt = getFileExtension(postData.file)

    if (!postData) {
        return createDiv()
    }

    const postCardLang = Language.postCard

    const postCardContainer = createDiv('post-card-container')
    const postCard = createDiv('post-card', postCardContainer)

    const postDataCont = createDiv('post-data-container', postCard)

    const postIdCont = createDiv('post-id-container', postDataCont)
    postIdCont.innerHTML = postData.id
    postIdCont.title = postCardLang.id

    const post_stats = postData.postRating
    const rating = post_stats.likes - post_stats.dislikes
    if (rating != 0) {
        const ratingCont = createDiv('inf-cont', postDataCont)
        const postScore = createDiv('rating', ratingCont)
        postScore.title = postCardLang.rating
        postScore.innerHTML = Math.abs(rating)
        switch (true) {
            case rating < 0: {
                postScore.innerHTML = '▼' + postScore.innerHTML
                postScore.style.color = 'rgb(200, 0, 0)'
            }; break;
            case rating > 0: {
                postScore.innerHTML = '▲' + postScore.innerHTML
                postScore.style.color = 'rgb(0, 200, 0)'
            }; break;
        }
    }

    if (postData.commentCount > 0) {
        const commentCont = createDiv('inf-cont', postDataCont)
        const postCommentsCount = createDiv('comments-count', commentCont)
        postCommentsCount.innerHTML = postData.commentCount
        postCommentsCount.title = postCardLang.CC
    }

    if (postData.postRating.faved) {
        const favCont = createDiv('inf-cont', postDataCont)
        const fav = createDiv('fav')
        fav.title = postCardLang.fav
        favCont.prepend(fav)

        const favImg = document.createElement('img')
        fav.appendChild(favImg)
        favImg.src = 'icons/fav.svg'
    }

    const imageContainer = createDiv('image-container', postCard)

    if (!noClickReaction) {
        const lnkElem = document.createElement('a')
        imageContainer.appendChild(lnkElem)
        lnkElem.className = 'link'
        const sTags = new URLSearchParams(window.location.search).get('tags')
        lnkElem.href = `/view?id=${postData.id}${sTags ? `&tags=${sTags}` : ''}`

        // if (['mp3', 'ogg', 'wav', 'flac'].includes(fileExt)) {
        //     lnkElem.addEventListener('click', (e) => {
        //         if (e.target === lnkElem && e.shiftKey) {
        //             e.preventDefault()
        //             musicController.startPlayerInHeader(`/file?userKey=${localStorage.getItem('userKey') || sessionStorage.getItem('userKey')}&id=${postData.id}`)
        //         }
        //     })
        // }
    }

    if (['mp3', 'ogg', 'wav', 'flac'].includes(fileExt)) {
        const audioPlaceholder = createDiv('audio-placeholder-cont', imageContainer)
        const symbCont = createDiv('symb-cont', audioPlaceholder)
        createDiv('symb', symbCont).innerHTML = `▶ ${fileExt.toUpperCase()}`
    } else {
        const previewImg = document.createElement('img')
        imageContainer.appendChild(previewImg)
        previewImg.className = 'preview-image'
        previewImg.src = `/file?userKey=${localStorage.getItem('userKey') || sessionStorage.getItem('userKey')}&id=${postData.id}&thumb=true`
    }

    const warningContainerContainer = createDiv('warning-container-container', postDataCont)

    const warningContainer = createDiv('warning-container', warningContainerContainer)

    function timeSinceCreation(time) {
        const date1 = Date.now();
        const date2 = new Date(time);
        const differenceInMilliseconds = Math.abs(date2 - date1);
        const differenceInHours = differenceInMilliseconds / (1000 * 60 * 60);
        return differenceInHours;
    }

    if (timeSinceCreation(postData.timestamp) < 12) {
        const new_ribbon = createDiv('new-ribbon', warningContainer)
        new_ribbon.innerHTML = postCardLang.newPost
    }

    if (postData.tags.length < 5) {
        const low_tags = createDiv('low-tags-ribbon', warningContainer)
        if (postData.tags.length == 0) {
            low_tags.innerHTML = postCardLang.LTA[0]
        } else {
            low_tags.innerHTML = postCardLang.LTA[1]
        }
    }

    function getFileExtension(filename) {
        const parts = filename.split('.');
        return parts.length > 1 ? parts.pop() : '';
    }
    if (['mp4', 'mov', 'avi', 'mkv', 'gif'].includes(fileExt)) {
        const video_ind_cont = createDiv('video-warning', warningContainer)
        if (fileExt != 'gif') {
            video_ind_cont.innerHTML = '▶ ' + postCardLang.video
        } else {
            video_ind_cont.innerHTML = '▶ GIF'
        }
    }

    if (['mp3', 'ogg', 'wav', 'flac'].includes(fileExt)) {
        const audio_ind_cont = createDiv('audio-warning', warningContainer)
        audio_ind_cont.innerHTML = `▶ ${postCardLang.audio}`
    }

    if (localStorage.getItem('EXPERIMENT_oldPostSizesIndicator') != 'true') {
        const defLine = createDiv('a-hd-indicator', imageContainer)
        const defin = createDiv('def', defLine)

        if (!!postData.size.x && !!postData.size.y) {
            defin.innerText = postData.size.x + '✖' + postData.size.y
            defin.title = Language.view.postData.size
        }

        if (postData.size.duration) {
            defin.innerText += ` ${Math.floor(postData.size.duration)}${postCardLang.duration}`
        }
    } else {
        const defins = [
            { type: '16K<br>UHD', active: (postData.size.y >= 8640) },
            { type: '8K<br>UHD', active: (postData.size.y >= 4320) },
            { type: '4K<br>UHD', active: (postData.size.y >= 2160) },
            { type: '1440<br>QHD', active: (postData.size.y >= 1440) },
            { type: '1080<br>FHD', active: (postData.size.y >= 1080) },
            { type: '720<br>HD', active: (postData.size.y >= 720) }
        ]

        for (const res of defins) {
            if (res.active) {
                const hd_indicator_cont = createDiv('hd-indicator', imageContainer)
                const hdText = createDiv('text', hd_indicator_cont)
                hdText.innerHTML = res.type
                break
            }
        }
    }

    return postCardContainer
}

// region create media player
function createMeadiaPlayer(url, parent, type = 'video', slim = false) {
    let isMediaActive = false

    const mediaCont = createDiv('media-container', parent);
    const mediaElem = document.createElement(type);
    mediaCont.appendChild(mediaElem);

    const source = document.createElement('source');
    mediaElem.appendChild(source);
    source.src = url;

    mediaElem.innerHTML += 'This media is unsupported by your browser';

    const savedVolume = localStorage.getItem('videoVolume');
    mediaElem.volume = savedVolume !== null ? parseFloat(savedVolume) : 0.2;

    mediaElem.addEventListener('volumechange', function () {
        localStorage.setItem('videoVolume', mediaElem.volume);
    });

    if (slim) {
        mediaCont.classList.add('slim')
    }

    let hourly = false
    mediaElem.addEventListener('loadedmetadata', () => {
        hourly = mediaElem.duration > 60 * 60
        timeElem.innerText = `${formatTime(Math.floor(mediaElem.currentTime), hourly)} / ${formatTime(Math.floor(mediaElem.duration), hourly)}`
    })

    const controlBar = createDiv('control-bar', mediaCont);

    if (type == 'audio') {
        mediaCont.classList.add('audio-player');
    } else {
        const fadeOutAndHide = () => mediaCont.classList.add('hidden');
        const fadeIn = () => mediaCont.classList.remove('hidden');
        const rstAnim = () => {
            clearTimeout(timeoutId);
            fadeIn();
            timeoutId = setTimeout(fadeOutAndHide, 5000);
        }

        let timeoutId = setTimeout(fadeOutAndHide, 5000);

        mediaCont.addEventListener('mouseenter', rstAnim);

        mediaCont.addEventListener('mousemove', rstAnim)

        mediaCont.addEventListener('mouseleave', () => {
            timeoutId = setTimeout(fadeOutAndHide, 5000);
        });
    }

    const sliderContainer = createDiv('slider-container', controlBar);
    const sliderBuffered = createDiv('slider-buffered', sliderContainer);
    const sliderPlayed = createDiv('slider-played', sliderContainer);
    const sliderThumb = createDiv('slider-thumb', sliderContainer);
    const timingControl = createDiv('timing-control', sliderThumb)

    let isTimeDragging = false;
    let timing = 0

    function setSliderPos(pos) {
        sliderPlayed.style.width = `${pos * 100}%`;
        sliderThumb.style.left = `${pos * 100}%`;
    }

    function moveSlider(e) {
        const rect = sliderContainer.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const clampedX = Math.max(0, Math.min(mouseX, rect.width));
        const newPos = (clampedX / rect.width)
        timing = newPos * mediaElem.duration
        setSliderPos(newPos)
    }

    sliderContainer.addEventListener("mousedown", (e) => {
        isTimeDragging = true;
        timingControl.classList.add('active')
        timingControl.innerText = formatTime(Math.floor(mediaElem.currentTime))
        mediaElem.pause()
        moveSlider(e);
    });

    document.addEventListener("mousemove", (e) => {
        if (isTimeDragging) {
            moveSlider(e);
            if (timing > mediaElem.currentTime) {
                timingControl.innerText = `${formatTime(Math.floor(mediaElem.currentTime))} → ${formatTime(Math.floor(timing))}`
            } else {
                timingControl.innerText = `${formatTime(Math.floor(timing))} ← ${formatTime(Math.floor(mediaElem.currentTime))}`
            }
        }
    });

    document.addEventListener("mouseup", () => {
        if (isTimeDragging) {
            timingControl.classList.remove('active')
            isTimeDragging = false;
            mediaElem.currentTime = timing
        }
    });

    function updateBuffered() {
        const duration = mediaElem.duration;
        if (!duration) return;
        sliderBuffered.innerHTML = "";

        for (let i = 0; i < mediaElem.buffered.length; i++) {
            const start = (mediaElem.buffered.start(i) / duration) * 100;
            const end = (mediaElem.buffered.end(i) / duration) * 100;

            const bufferedSegment = createDiv('buffered-segment', sliderBuffered);
            bufferedSegment.style.left = `${start}%`;
            bufferedSegment.style.width = `${end - start}%`;
        }
    }

    function updateSlider() {
        const duration = mediaElem.duration;
        const currentTime = mediaElem.currentTime;
        if (!duration) return;
        setSliderPos(currentTime / duration)
    }

    mediaElem.addEventListener('progress', updateBuffered);
    mediaElem.addEventListener('timeupdate', updateSlider);

    const playPauseButton = createDiv('play-pause', controlBar);
    playPauseButton.style = '--lnk:url(icons/video-play.svg)'

    mediaElem.addEventListener('play', () => {
        playPauseButton.style = '--lnk:url(icons/video-pause.svg)'
    })
    mediaElem.addEventListener('pause', () => {
        playPauseButton.style = '--lnk:url(icons/video-play.svg)'
    })

    function videoPlayPause() {
        if (mediaElem.paused) {
            mediaElem.play();
            if (type == 'audio') {
                musicController.listenTo(mediaElem, url)
            }
        } else {
            mediaElem.pause();
        }
    }

    playPauseButton.addEventListener("click", videoPlayPause);
    mediaElem.addEventListener('click', e => {
        if (e.target != mediaElem) return;
        videoPlayPause();
    });

    const volumeCont = createDiv('volume-cont', controlBar)
    const volumeTrack = createDiv('volume-track', volumeCont)
    const volumeVal = createDiv('volume-val', volumeTrack)
    const volumeThumb = createDiv('volume-thumb', volumeTrack)
    const volumeValOverlay = createDiv('volume-val-overly', volumeThumb)

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    let isAudioDragging = false

    let currentVolume = isMobile ? 0.5 : parseFloat(localStorage.getItem('videoVolume')) || 0.5;
    mediaElem.volume = currentVolume;

    function setAudioSliderPos(pos) {
        volumeValOverlay.innerHTML = Math.ceil(pos * 100)
        volumeVal.style.width = `${pos * 100}%`;
        volumeThumb.style.left = `${pos * 100}%`;
    }

    if (isMobile) {
        volumeCont.remove()
    } else {
        setAudioSliderPos(mediaElem.volume)

        function moveAudioSlider(e) {
            const rect = volumeTrack.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const clampedX = Math.max(0, Math.min(mouseX, rect.width));
            const newVol = (clampedX / rect.width)
            mediaElem.volume = newVol
            setAudioSliderPos(newVol)
        }

        volumeTrack.addEventListener('mousedown', (e) => {
            isAudioDragging = true
            moveAudioSlider(e)
        })

        document.addEventListener("mousemove", (e) => {
            if (isAudioDragging) {
                moveAudioSlider(e);
            }
        });

        document.addEventListener("mouseup", () => {
            if (isAudioDragging) {
                isAudioDragging = false;
            }
        });
    }

    const timeElem = createDiv('time-counter', controlBar)

    mediaElem.addEventListener('timeupdate', () => {
        timeElem.innerText = `${formatTime(Math.floor(mediaElem.currentTime), hourly)} / ${formatTime(Math.floor(mediaElem.duration), hourly)}`
    });

    function formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hourly || hours > 0) {
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    const FSV = createDiv('full-screen', controlBar);

    function switchFullscreen() {
        if (!document.fullscreenElement) {
            mediaCont.requestFullscreen().catch(err => console.error("Error:", err));
            mediaElem.style.maxHeight = '100%';
        } else {
            document.exitFullscreen();
            mediaElem.removeAttribute('style');
        }
    }

    FSV.addEventListener('click', switchFullscreen);

    document.addEventListener("fullscreenchange", () => {
        if (!document.fullscreenElement) {
            mediaElem.removeAttribute('style');
        }
    });

    document.addEventListener('click', (e) => {
        isMediaActive = e.target == mediaElem
    })

    document.addEventListener('keydown', (e) => {
        if (!isMediaActive) return
        switch (e.code) {
            case 'Space': {
                videoPlayPause()
            }; break;
            case 'KeyW': {
                mediaElem.volume = Math.min(1, mediaElem.volume + 0.05)
                setAudioSliderPos(mediaElem.volume)
            }; break;
            case 'KeyS': {
                mediaElem.volume = Math.max(0, mediaElem.volume - 0.05)
                setAudioSliderPos(mediaElem.volume)
            }; break;
            case 'KeyA': {
                mediaElem.currentTime -= 5
            }; break;
            case 'KeyD': {
                mediaElem.currentTime += 5
            }; break;
            case 'KeyF': {
                switchFullscreen()
            }; break;
            case 'ArrowUp': {
                mediaElem.volume = Math.min(1, mediaElem.volume + 0.05)
                setAudioSliderPos(mediaElem.volume)
            }; break;
            case 'ArrowDown': {
                mediaElem.volume = Math.max(0, mediaElem.volume - 0.05)
                setAudioSliderPos(mediaElem.volume)
            }; break;
            case 'ArrowLeft': {
                mediaElem.currentTime -= 5
            }; break;
            case 'ArrowRight': {
                mediaElem.currentTime += 5;
            } break;
            default: return
        }
        e.preventDefault()
        rstAnim()
    })

    return { cont: mediaCont, player: mediaElem, controls: controlBar };
}

try {
    setFooterText()
} catch { }

//region footer text
function setFooterText() {
    const footerLang = Language.footer

    const footer = document.querySelector('footer')
    footer.innerHTML = ''

    const main_text = createDiv('main-text', footer)
    main_text.innerHTML = footerLang.disclaimer

    const actions = createDiv('actions-row', footer)

    createAction('EULA', actions, () => {
        window.open('/eula', '_blank').focus();
    }).title = footerLang.eula

    createAction('Github', actions, () => {
        window.open('https://github.com/Vide0Master/pi-archive', '_blank').focus();
    }).title = footerLang.github

    createAction(footerLang.tgbot[0], actions, async () => {
        window.open('https://t.me/pi_archive_bot', '_blank').focus();
    }).title = footerLang.tgbot[1]

    createAction(footerLang.pathNotes, actions, async () => {
        const overlay = createBlurOverlay()
        overlay.addEventListener('click', (e) => {
            if (e.target == overlay) overlay.remove()
        })
        const versInfo = await request('getVersionInfo')
        const pInfo = await request('getPatchNotes')

        const vcont = createDiv('patchNotesContainer', overlay)
        const closeCont = createDiv('closeCont', vcont)
        const xSymb = createDiv('close', closeCont)
        xSymb.innerHTML = '✖'
        closeCont.addEventListener('click', (e) => {
            overlay.remove()
        })

        const labelList = createDiv('label-list', vcont)
        for (const compName in versInfo) {
            const compLabel = createDiv('v-label', labelList)
            compLabel.innerHTML = compName + ' ' + versInfo[compName]
            compLabel.classList.add(compName)
        }

        const updateList = createDiv('update-list', vcont)
        for (const update of pInfo) {
            const updateContainer = createDiv('update-container', updateList)

            const versionsRow = createDiv('version-row', updateContainer)

            const updDate = createDiv('update-date', versionsRow)
            updDate.innerHTML = update.date

            for (const versionLabel in update.versions) {
                if (update.versions[versionLabel] != '') {
                    const versionContainer = createDiv('version-container', versionsRow)
                    if (update.versions[versionLabel] == versInfo[versionLabel]) {
                        const currentLabel = createDiv('current-label', versionContainer)
                        currentLabel.innerHTML = 'CURRENT'
                    }
                    const verValue = createDiv('v-label', versionContainer)
                    verValue.innerHTML = update.versions[versionLabel]
                    verValue.classList.add(versionLabel)
                }
            }

            const updatesCol = createDiv('updates-list', updateContainer)
            for (const upd of update.updates) {
                const lineContainer = createDiv('line-cont', updatesCol)

                const label = createDiv('line-label', lineContainer)

                const tagLine = createDiv('tag-line', label)
                if (upd.services && upd.services.length > 0) {
                    for (const service of upd.services) {
                        const servLabel = createDiv('v-label', tagLine)
                        servLabel.innerHTML = service
                        servLabel.classList.add(service)
                    }
                }

                if (upd.tag) {
                    const tag = createDiv('line-tag', tagLine)
                    tag.innerHTML = upd.tag.toUpperCase()
                    tag.classList.add(upd.tag)
                }

                label.innerHTML += upd.text


                if (upd.users && upd.users.length > 0) {
                    const appliesToCont = createDiv('applies-to-cont', lineContainer)
                    createDiv('intro', appliesToCont).innerHTML = 'For:'

                    for (const lvl of upd.users) {
                        createDiv(lvl, appliesToCont).innerHTML = capitalizeFirstLetter(lvl)
                    }
                }
            }
        }
    })

    createAction('R.I.P.', actions, () => {
        openRIP()
    })
    //createIndicator('g', sysLabel)

    // const sysHealthInfoContainer = createDiv('sys-health-container', footer)

    // const sysHealthSizer = createDiv('sys-health-sizer', sysHealthInfoContainer)
    // const sysLabelSizer = createDiv('', sysHealthSizer)
    // sysLabelSizer.innerHTML = footerLang.status.label

    // const sysHealth = createDiv('sys-healt-info', sysHealthInfoContainer)
    // const sysLabel = createDiv('', sysHealth)
    // sysLabel.innerHTML = footerLang.status.label

    // const elementCont = createDiv('elements-container', sysHealth)

    // const versions = createDiv('version-list', elementCont)
    // const verLabel = createDiv('vlabel', versions)
    // verLabel.innerHTML = footerLang.status.vLabel

    // async function getVers() {
    //     const versInfo = await request('getVersionInfo')
    //     for (const ver in versInfo) {
    //         const verBlock = createDiv('', versions)
    //         verBlock.innerHTML = `${ver}: ${versInfo[ver]}`
    //     }
    // }
    // getVers()

    // const systemRepots = createDiv('sysRepCont', elementCont)
    // const sysRepLabel = createDiv('label',systemRepots)
    // sysRepLabel.innerHTML = footerLang.status.systemReports
}

//region circ ind
function createIndicator(state, parent) {
    const elem = createDiv('indicator', parent)
    elem.classList.add(state)
    return elem
}

//region cr Div
function createDiv(className, parentElem) {
    const div = document.createElement('div')
    !!className ? div.className = className : {}
    if (parentElem) {
        parentElem.appendChild(div)
    }
    return div
}

//region cr Button
function createButton(name, parentElem) {
    const btn = document.createElement('input')
    btn.type = 'button'
    btn.value = name
    if (parentElem) {
        parentElem.appendChild(btn)
    }
    return btn
}

//region cr switch
function createSwitch(name, parent, cb, checked = false, iconLink) {
    const swLine = createDiv('switch-line', parent)

    if (iconLink) {
        const icon = createDiv('sw-icon', swLine)
        icon.style = `--sw-icon-link:url(${iconLink})`
    }

    createDiv('sw-label', swLine).innerHTML = name
    const sw = document.createElement('input')
    sw.type = 'checkbox'
    sw.checked = checked
    swLine.appendChild(sw)
    sw.addEventListener('change', () => cb(sw.checked))
    return swLine
}

//region cr blur
function createBlurOverlay() {
    const overlay = createDiv('blurry-overlay')
    document.body.appendChild(overlay);
    return overlay
}

//region Message count
async function getMessageCount() {
    const msgCountLang = Language.msgCount
    const countRslt = await request('controlUserDM', { type: 'getUserMessagesCount' })

    const messages_link = document.querySelector('.nav-row').querySelector('.messages')
    const counter = createDiv('counter')
    messages_link.insertAdjacentElement('afterbegin', counter)
    counter.innerHTML = '0'

    async function updateState(count) {
        if (count.unread > 0 || count.requiredAction) {
            counter.classList.add('visible')
            counter.removeAttribute('style')
            if (count.requiredAction) {
                counter.style.backgroundColor = '#a53030'
                counter.innerText = '!'
                counter.title = msgCountLang[0]
                return
            }

            if (count.unread > 0) {
                counter.innerText = count.unread
                counter.title = msgCountLang[1]
                for (const user in count.unreadPerUser) {
                    const userName = await getUserName(user)
                    counter.title += `\n${userName}: ${count.unreadPerUser[user]}`
                }
            }
        } else {
            counter.classList.remove('visible')
        }
    }

    updateState(countRslt)

    WSListener('messageCountUpdate', '', (data) => {
        updateState(data.count)
    })
}

//region get username
async function getUserName(login) {
    const user = await request('getUserProfileData', { login })
    return user.data.username
}

//region create user name
function createUserName(login, elem, params = { link: true, popup: true, status: false },) {
    const container = createDiv('user-name-container', elem)

    async function processUserName() {
        const userData = await request('getUserProfileData', { login })
        if (userData.data) {
            if (params.link) {
                const link = document.createElement('a')
                container.appendChild(link)
                link.innerHTML = userData.data.username
                link.href = '/profile?user=' + userData.data.login
            } else {
                container.innerHTML = userData.data.username
            }

            try {
                if (userData.data.trueUserStatus) {
                    container.classList.add(userData.data.trueUserStatus)
                }
            } catch { }

            if (params.status) {
                const status = createDiv('ACTstatus', container)
                WSListener('userStatusUpdate', userData.data.login, (data) => {
                    status.classList.remove(...['online', 'afk', 'offline'])
                    status.classList.add(data.state)
                    status.title = Language.userActivityState[data.state]
                })
                WSSend('getUserActivity', { user: userData.data.login })
            }

            if (!params.popup) return

            const popUp = createDiv('pop-up', container)
            popUp.style.display = 'none';
            const state = {
                open: false,
                close: true,
                anend: true
            }

            container.addEventListener('mouseenter', () => {
                popUp.style = ''

                if (state.open || !state.anend) return
                state.open = true
                state.close = false
                state.anend = false
                popUp.style.animation = 'popin 0.2s linear forwards'
            })

            container.addEventListener('mouseleave', () => {
                if (state.close || !state.anend) return
                state.open = false
                state.close = true
                state.anend = false
                popUp.style.animation = 'popout 0.2s linear forwards'
            })

            popUp.addEventListener('animationend', () => {
                state.anend = true
            })

            if (userData.data.usersettings.ProfileAvatarPostID) {
                createUserAvatarElem(userData.data.usersettings.ProfileAvatarPostID, popUp, false)
            }

            const dataBlock = createDiv('data-block', popUp)

            if (!params.status && userData.data.usersettings.ProfileAvatarPostID) {
                const status = createDiv('ACTstatus', popUp.querySelector('.avatar-elem'))
                WSListener('userStatusUpdate', userData.data.login, (data) => {
                    status.classList.remove(...['online', 'afk', 'offline'])
                    status.classList.add(data.state)
                    status.title = Language.userActivityState[data.state]
                })
                WSSend('getUserActivity', { user: userData.data.login })
            } else {
                const status = createDiv('ACTstatus', dataBlock)
                WSListener('userStatusUpdate', userData.data.login, (data) => {
                    status.classList.remove(...['online', 'afk', 'offline'])
                    status.classList.add(data.state)
                    status.innerHTML = Language.userActivityState[data.state]
                })
                WSSend('getUserActivity', { user: userData.data.login })
            }

            const userStatus = createDiv('user-status', dataBlock)
            userStatus.innerHTML = capitalizeFirstLetter(Language.user_status_translation[userData.data.status])
            userStatus.classList.add(userData.data.status)

            const userJoin = createDiv('user-join', dataBlock)
            userJoin.innerHTML = parseTimestamp(userData.data.creationdate)
            userJoin.title = Language.profile.userData.creationdate

            const userPosts = document.createElement('a')
            dataBlock.appendChild(userPosts)
            userPosts.classList.add('user-posts')
            userPosts.innerHTML = Language.profile.userData.postsCount + ": " + userData.data.postsCount
            userPosts.href = `/search?tags=author:${userData.data.login}`

            switch (true) {
                case userData.data.postsCount > 1000: {
                    userPosts.classList.add('legend')
                }; break;
                case userData.data.postsCount > 400: {
                    userPosts.classList.add('sentinel')
                }; break;
                case userData.data.postsCount > 20: {
                    userPosts.classList.add('active-user')
                }; break;
                default: {
                    userPosts.classList.add('newbie')
                }; break;
            }

        } else {
            container.innerHTML = 'No user'
        }
    }
    processUserName()
    return container
}


//region capitalaze
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

//region create group
function createGroup(groupData) {
    const tempCont = createDiv('temp-container')
    tempCont.style.display = 'none'

    async function process() {
        const post_list = await request('getPosts',
            {
                query: `id:${groupData.group.join(',')}`,
                page: 1,
                postsCount: 9999,
                grpOverride: true
            })

        const postCardList = []
        const outlines = []
        let lastCardUnopened

        function regOutlineTrigger(elem) {
            elem.addEventListener('mouseenter', () => {
                outlines.forEach(ln => {
                    ln.classList.add('active')
                })
            })
            elem.addEventListener('mouseleave', () => {
                outlines.forEach(ln => {
                    ln.classList.remove('active')
                })
            })
        }

        const groupControlCont = createDiv('group-element-container', tempCont)
        regOutlineTrigger(groupControlCont)
        groupControlCont.style.setProperty('--borderclr', groupData.color)

        const infoContainer = createDiv('group-info-container', groupControlCont)
        outlines.push(infoContainer)

        const groupNameLine = createDiv('group-name', infoContainer)
        groupNameLine.innerText = groupData.name


        if (post_list.length > 5) {
            const additinalCardsController = createDiv('additional-cards', infoContainer)
            additinalCardsController.innerText = `${post_list.length - 5}`
            const additionalSymb = createDiv('add-symb', additinalCardsController)
            additionalSymb.innerHTML = '+'
            let isOpen = false
            additinalCardsController.addEventListener('click', () => {
                if (isOpen) {
                    postCardList.forEach((elm, i) => {
                        if (i >= 5) elm.style.display = 'none'
                    })
                    additionalSymb.innerHTML = '+'
                    lastCardUnopened.classList.add('group-last-border')
                } else {
                    postCardList.forEach((elm) => {
                        elm.style.display = ''
                    })
                    additionalSymb.innerHTML = '−'
                    lastCardUnopened.classList.remove('group-last-border')
                }
                isOpen = !isOpen
            })
        }

        const groupIDScores = 'GROUP:' + groupData.id

        const userData = await request('controlScoreAndFavs', { type: 'getUserInfo' })

        const groupScore = createDiv('group-score', infoContainer)
        const scoreUp = createDiv('score-up', groupScore)
        scoreUp.innerText = '▲'
        if (userData.likes.includes(groupIDScores))
            scoreUp.classList.add('active')

        const scoreMedian = createDiv('score-median', groupScore)
        scoreMedian.title = Language.postCard.rating
        const scoreDown = createDiv('score-down', groupScore)
        scoreDown.innerText = '▼'
        if (userData.dislikes.includes(groupIDScores))
            scoreDown.classList.add('active')

        async function updateScore(scr) {
            let groupMedian = scr
            if (!scr) {
                const post_stats = await request('controlScoreAndFavs', { type: 'getPostScore', postID: groupIDScores })
                groupMedian = post_stats.scores.likes - post_stats.scores.dislikes
            }

            if (groupMedian === 0) {
                groupScore.classList.add('hiddable')
                scoreMedian.innerHTML = groupMedian
                scoreMedian.classList.remove('down')
                scoreMedian.classList.remove('up')
            } else if (groupMedian > 0) {
                groupScore.classList.remove('hiddable')
                scoreMedian.innerHTML = groupMedian + '▲'
                scoreMedian.classList.remove('down')
                scoreMedian.classList.add('up')
            } else {
                groupScore.classList.remove('hiddable')
                scoreMedian.innerHTML = -groupMedian + '▼'
                scoreMedian.classList.remove('up')
                scoreMedian.classList.add('down')
            }
        }
        updateScore(groupData.scores.likes - groupData.scores.dislikes)

        scoreUp.addEventListener('click', async () => {
            if (scoreUp.classList.contains('active')) {
                const likeResult = await request('controlScoreAndFavs', { type: 'removeLike', postID: groupIDScores })
                if (likeResult.rslt == 'e') {
                    alert(likeResult.rslt + '/' + likeResult.msg)
                    return
                }
                scoreUp.classList.remove('active')
            } else {
                const likeResult = await request('controlScoreAndFavs', { type: 'setLike', postID: groupIDScores })
                if (likeResult.rslt == 'e') {
                    alert(likeResult.rslt + '/' + likeResult.msg)
                    return
                }
                scoreUp.classList.add('active')
                if (scoreDown.classList.contains('active')) {
                    const unlikeResult = await request('controlScoreAndFavs', { type: 'removeDislike', postID: groupIDScores })
                    if (unlikeResult.rslt == 'e') {
                        alert(unlikeResult.rslt + '/' + unlikeResult.msg)
                        return
                    }
                    scoreDown.classList.remove('active')
                }
            }
            updateScore()
        })

        scoreDown.addEventListener('click', async () => {
            if (scoreDown.classList.contains('active')) {
                const unlikeResult = await request('controlScoreAndFavs', { type: 'removeDislike', postID: groupIDScores })
                if (unlikeResult.rslt == 'e') {
                    alert(unlikeResult.rslt + '/' + unlikeResult.msg)
                    return
                }
                scoreDown.classList.remove('active')
            } else {
                const unlikeResult = await request('controlScoreAndFavs', { type: 'setDislike', postID: groupIDScores })
                if (unlikeResult.rslt == 'e') {
                    alert(unlikeResult.rslt + '/' + unlikeResult.msg)
                    return
                }
                scoreDown.classList.add('active')
                if (scoreUp.classList.contains('active')) {
                    const likeResult = await request('controlScoreAndFavs', { type: 'removeLike', postID: groupIDScores })
                    if (likeResult.rslt == 'e') {
                        alert(likeResult.rslt + '/' + likeResult.msg)
                        return
                    }
                    scoreUp.classList.remove('active')
                }
            }
            updateScore()
        })

        if (groupData.type == 'collection') {
            const colview = createAction(Language.group.colView, infoContainer, null, 'icons/collections-icon.svg')
            colview.addEventListener('mousedown', (event) => {
                const sTags = new URLSearchParams(window.location.search).get('tags')
                const Link = `/collection?id=${groupData.id}${sTags ? `&tags=${sTags}` : ''}`
                if (event.button === 1)
                    event.preventDefault()
                if ((event.button === 0 && event.ctrlKey) || event.button === 1) {
                    window.open(Link, '_blank').focus();
                    return
                }
                window.location.href = Link
            })
        }

        const groupID = createDiv('group-id', infoContainer)
        groupID.innerHTML = groupData.id
        groupID.title = 'ID'

        post_list.forEach((postData, cardN) => {
            const postCard = createPostCard(postData)
            if (cardN == post_list.length - 1) {
                postCard.classList.add('group-last-border')
            }
            tempCont.appendChild(postCard)
            postCardList.push(postCard)
            postCard.style.setProperty('--borderclr', groupData.color)
            const outline = createDiv('group-outline')
            postCard.insertBefore(outline, Array.from(postCard.childNodes)[0])
            outlines.push(outline)
            regOutlineTrigger(postCard)
        })

        if (post_list.length > 5) {
            lastCardUnopened = postCardList[4]
            lastCardUnopened.classList.add('group-last-border')
        }

        postCardList.forEach((cont, i) => {
            if (i >= 5) cont.style.display = 'none'
        })

        let parent = tempCont
        Array.from(tempCont.children).forEach((child) => {
            parent.parentNode.insertBefore(child, parent.nextSibling);
            parent = child;
        })
    }
    process()

    return tempCont
}

//region cr select
function createSelect(list, placeholder = '', onChangeCallback) {

    const selectElement = document.createElement('select');

    if (placeholder) {
        const placeholderOption = document.createElement('option');
        placeholderOption.value = '';
        placeholderOption.textContent = placeholder;
        placeholderOption.disabled = true;
        placeholderOption.selected = true;
        placeholderOption.hidden = true;
        selectElement.appendChild(placeholderOption);
    }

    list.forEach(item => {
        const option = document.createElement('option');
        option.value = item.value;
        option.textContent = item.name;
        selectElement.appendChild(option);
    });

    selectElement.addEventListener('change', () => {
        const selectedValue = selectElement.value;
        onChangeCallback(selectedValue);
    });

    return selectElement;
}

//region create reorderer
function reorderOverlay(group, callback) {
    const container = createDiv('reorderer-container');

    const RENDER = async () => {
        const label = createDiv('label');
        container.appendChild(label);
        label.innerText = `"${group.name}" ID:${group.id}`;

        const reorderContainer = createDiv('reord-cont');
        container.appendChild(reorderContainer);

        const idToElementMap = new Map();

        for (const ID of group.group) {
            const postData = await request('getPostData', { id: ID });
            if (postData.rslt != 's') {
                alert(`${postData.rslt}/${postData.msg}`)
                container.remove()
                return
            }
            const pcard = createPostCard(postData.post, true);
            pcard.draggable = true;
            pcard.dataset.id = ID;
            idToElementMap.set(ID, pcard);
            reorderContainer.appendChild(pcard);
        }

        let draggedItem = null;
        let selectedItem = null;

        const pcardClass = '.post-card-container'

        reorderContainer.addEventListener('dragstart', (e) => {
            if (e.target.closest(pcardClass)) {
                draggedItem = e.target.closest(pcardClass);
                draggedItem.classList.add('dragging');
            }
        });

        reorderContainer.addEventListener('dragend', (e) => {
            if (draggedItem) {
                draggedItem.classList.remove('dragging');
                draggedItem = null;
            }
            updateOrder();
        });

        reorderContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        reorderContainer.addEventListener('dragenter', (e) => {
            const target = e.target.closest(pcardClass);
            if (target && target !== draggedItem) {
                target.classList.add('over');
            }
        });

        reorderContainer.addEventListener('dragleave', (e) => {
            const target = e.target.closest(pcardClass);
            if (target && target !== draggedItem) {
                target.classList.remove('over');
            }
        });

        reorderContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            const target = e.target.closest(pcardClass);
            if (target && target !== draggedItem) {
                const allItems = Array.from(reorderContainer.querySelectorAll(pcardClass));
                const draggedIndex = allItems.indexOf(draggedItem);
                const targetIndex = allItems.indexOf(target);

                if (draggedIndex < targetIndex) {
                    reorderContainer.insertBefore(draggedItem, target.nextSibling);
                } else {
                    reorderContainer.insertBefore(draggedItem, target);
                }

                target.classList.remove('over');
            }
        });

        function updateOrder() {
            const items = Array.from(reorderContainer.querySelectorAll(pcardClass));
            const order = items.map(item => item.dataset.id);
        }

        reorderContainer.addEventListener('click', (e) => {
            const target = e.target.closest(pcardClass);
            if (target && target !== selectedItem) {
                if (selectedItem) {
                    selectedItem.classList.remove('selected');
                }
                selectedItem = target;
                selectedItem.classList.add('selected');
            } else if (target === selectedItem) {
                selectedItem.classList.remove('selected');
                selectedItem = null;
            }
        });

        reorderContainer.addEventListener('click', (e) => {
            const target = e.target.closest(pcardClass);
            if (target && selectedItem && target !== selectedItem) {
                const allItems = Array.from(reorderContainer.querySelectorAll(pcardClass));
                const selectedIndex = allItems.indexOf(selectedItem);
                const targetIndex = allItems.indexOf(target);

                if (selectedIndex < targetIndex) {
                    reorderContainer.insertBefore(selectedItem, target.nextSibling);
                } else {
                    reorderContainer.insertBefore(selectedItem, target);
                }

                selectedItem.classList.remove('selected');
                selectedItem = null;
                updateOrder();
            }
        });

        const button_row = createDiv('button-row');
        container.appendChild(button_row);

        const editorLng = Language.group.editor

        const cancel_btn = createButton(editorLng.cancel);
        button_row.appendChild(cancel_btn);
        cancel_btn.addEventListener('click', () => {
            callback('cancel')
        });

        const delete_btn = createButton(editorLng.delete);
        delete_btn.style.backgroundColor = 'red';
        button_row.appendChild(delete_btn);
        delete_btn.addEventListener('click', (e) => {
            if (e.shiftKey) {
                callback('fullDelete')
            } else {
                callback('delete')
            }
        });

        const rename_btn = createButton(editorLng.rename);
        button_row.appendChild(rename_btn);
        rename_btn.addEventListener('click', () => {
            callback('rename')
        });

        const colorSel = document.createElement('input')
        button_row.appendChild(colorSel);
        colorSel.type = 'color'
        colorSel.value = group.color
        colorSel.title = editorLng.color
        colorSel.addEventListener('change', () => {
            callback('color', colorSel.value)
        })

        const confirm_btn = createButton(editorLng.accept);
        button_row.appendChild(confirm_btn);
        confirm_btn.addEventListener('click', () => {
            const items = Array.from(reorderContainer.querySelectorAll(pcardClass));
            const order = items.map(item => item.dataset.id);
            callback('reorder', order);
        });
    };

    RENDER();

    return container;
}

//region copy to CB
function copyToClipboard(value, message) {
    const tempTextarea = document.createElement('textarea');
    tempTextarea.value = value;
    tempTextarea.setAttribute('readonly', '');
    tempTextarea.style.position = 'absolute';
    tempTextarea.style.left = '-9999px';

    document.body.appendChild(tempTextarea);

    tempTextarea.select();
    tempTextarea.setSelectionRange(0, tempTextarea.value.length);

    document.execCommand('copy');

    document.body.removeChild(tempTextarea);

    alert(`i/${message}`, 5000);
}

//region search
function search(taglist, alert) {
    const tags = taglist.trim().split(/\s/).filter(val => val !== '');

    let query_page = `/search?tags=`

    query_page += tags.join('+')

    if (alert) {
        query_page += `&alert=${alert.rslt}/${alert.msg}`
    }

    window.location.href = query_page
}

//region format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Б';
    const k = 1024;
    const sizes = ['B', 'Kb', 'Mb', 'Gb'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const size = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
    return `${size} ${sizes[i]}`;
}

//region cr tag line
function createTagline(tag, params = { s: true, tedit: true }) {
    const tagline = document.createElement('div');
    tagline.className = 'tagline';

    const linkElems = [];

    let originalColor = '#49e8fc';
    if (tag.group) {
        originalColor = tag.group.color;
    }
    tagline.style = `--tagColor:${originalColor}`
    const searchElem = document.getElementById('taglist')

    if (searchElem && searchElem.value != '') {
        if (params.tedit) {
            const plusElem = createAction('+', tagline, () => {
                const tagsList = searchElem.value.trim().split(/\s/).filter(val => val !== '')
                tagsList.push(tag.tag)
                searchElem.value = tagsList.join(' ')
                if (params.s)
                    search(searchElem.value);
            });
            linkElems.push(plusElem);
        }

        if (params.tedit) {
            const minusElem = createAction('−', tagline, () => {
                const tagsList = searchElem.value.trim().split(/\s/).filter(val => val !== '')
                tagsList.push("−" + tag.tag)
                searchElem.value = tagsList.join(' ')
                if (params.s)
                    search(searchElem.value);
            });
            linkElems.push(minusElem);
        }
    }

    const tagElem = createAction(tag.tag, tagline, () => {
        if (params.tedit)
            searchElem.value = tag.tag;
        if (params.s)
            search(searchElem.value);
    });
    linkElems.push(tagElem);

    if (tag.group) tagElem.title = tag.group.name[CURRENTLANG]

    if (tag.count > 0) {
        const tagquantitty = document.createElement('div');
        tagline.appendChild(tagquantitty);
        tagquantitty.innerText = tag.count > 999 ? `${(tag.count / 1000).toFixed(1)}k` : tag.count;
        tagquantitty.className = 'tag-quantity';
    }

    return tagline
}

//region cr tag select
async function createTagSelector(tags, elem) {
    const taglist = await request('getTagsList', { taglist: tags });
    const tagcol = elem
    tagcol.innerHTML = '';

    const groups = []

    //{name: '', priority:0, tags:[]}

    for (const tag of taglist) {
        if (tag.group) {
            if (!groups.find(val => val.id == tag.group.id)) {
                groups.push({ id: tag.group.id, name: tag.group.name, priority: tag.group.priority, tags: [] })
            }
            const defaultGroupIndex = groups.findIndex(val => val.id == tag.group.id)
            groups[defaultGroupIndex].tags.push(tag)
        } else {
            if (!groups.find(val => val.id == -1)) {
                groups.push({ id: -1, name: Language.defaultTags, priority: 0, tags: [] })
            }
            const defaultGroupIndex = groups.findIndex(val => val.name == Language.defaultTags)
            groups[defaultGroupIndex].tags.push(tag)
        }
    }

    groups.sort((a, b) => b.priority - a.priority)

    const tagblock = tagcol

    for (const group of groups) {
        const groupelem = createDiv('tag-group', tagblock)

        const label = createDiv('label', groupelem)
        if (typeof group.name != 'object') {
            label.innerText = group.name
        } else {
            label.innerText = group.name[CURRENTLANG]
        }

        for (const grTag of group.tags) {
            groupelem.appendChild(createTagline(grTag))
        }
    }
}

//region own verify
async function ownerVerify(uname) {
    const user = await request('getUserProfileData', { userKey });
    return user.data.login == uname;
}

//region adm verify
async function adminVerify() {
    const user = await request('getUserProfileData', { userKey });
    return user.data.acc_level > 1;
}

//region parse tmst
function parseTimestamp(timestamp) {
    timestamp = parseInt(timestamp)
    const now = new Date();
    const date = new Date(timestamp);

    const time = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    const fullDate = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;

    const isToday = now.toDateString() === date.toDateString();
    const isYesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString() === date.toDateString();

    if (isToday) {
        return `${Language.timestamps.today}, ${time}`;
    } else if (isYesterday) {
        return `${Language.timestamps.yesterday}, ${time}`;
    } else if (date.getFullYear() === now.getFullYear()) {
        return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')} ${time}`;
    } else {
        return `${fullDate}`;
    }
}

//region elem vis obs
function onElementVisible(element, callback) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio === 1) {
                callback()
                observer.unobserve(element)
            }
        });
    }, {
        threshold: 0.1
    });

    observer.observe(element);
}

//region format user inp
function formatUserText(input) {
    let formattedText = input
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
        .replace(/\*(.*?)\*/g, '<i>$1</i>')
        .replace(/_(.*?)_/g, '<u>$1</u>')
        .replace(/\n/g, '<br>');
    return formattedText;
}

//region popup input
//! MOVED TO alert.js FUNCTIONALITY
//endregion

//region themes
const colorSchemesList = [
    { name: 'default', value: 'default' },
    { name: 'dark', value: 'dark' },
    { name: 'egypt', value: 'egypt' },
    { name: 'nature', value: 'nature' },
    { name: 'pony', value: 'pony' },
    { name: 'custom', value: 'custom' },
]

function setTheme() {
    const theme = localStorage.getItem('theme')
    if (!theme) {
        localStorage.setItem('theme', 'default')
        setTheme()
        return
    }

    const link = document.getElementById("theme-style");

    try {
        const themeList = JSON.parse(theme)
        const styleElem = document.createElement('style')
        styleElem.id = 'custom-style-elem'
        link.insertAdjacentElement('afterend', styleElem)
        styleElem.innerText = ':root{'
        for (const ID in themeList) {
            styleElem.innerText += `${ID}: ${themeList[ID]};`
        }
        styleElem.innerText += '}'
        return
    } catch { }

    const customStyle = document.getElementById('custom-style-elem')
    if (customStyle) customStyle.remove()

    if (link) {
        link.href = `themes/${theme}.css`;
    } else {
        const newLink = document.createElement("link");
        newLink.rel = "stylesheet";
        newLink.id = "theme-style";
        newLink.href = `themes/${theme}.css`;
        document.head.appendChild(newLink);
    }
}

setTheme()

//region create avatar element
function createUserAvatarElem(postID, parent, isLinkToPost, Hquery) {
    if (postID) {
        const avatar_block = createDiv('avatar-elem')
        if (parent) parent.appendChild(avatar_block)

        async function processAvatar() {
            const avatarPostData = await request('getPostData', { id: postID })
            if (avatarPostData.rslt == 's') {
                let avatar
                switch (true) {
                    case ['.jpg', '.jpeg', '.png', '.webp', '.gif'].some(end => avatarPostData.post.file.endsWith(end)): {
                        avatar = document.createElement('img')
                        avatar_block.appendChild(avatar)
                        avatar.src = `/file?userKey=${localStorage.getItem('userKey') || sessionStorage.getItem('userKey')}&id=${postID}${avatarPostData.post.file.endsWith('.gif') ? '' : Hquery ? '' : "&thumb=true"}${Hquery && !avatarPostData.post.file.endsWith('.gif') ? `&h=${Hquery}` : ''}`
                    }; break;
                    case ['.mp4', '.mov', '.avi', '.mkv'].some(end => avatarPostData.post.file.endsWith(end)): {
                        avatar = document.createElement('video');
                        avatar.controls = false;
                        avatar.autoplay = true;
                        avatar.loop = true;
                        avatar.volume = 0
                        avatar.alt = 'video preview';
                        avatar.src = `/file?userKey=${localStorage.getItem('userKey') || sessionStorage.getItem('userKey')}&id=${postID}`
                        avatar.addEventListener('timeupdate', () => {
                            if (avatar.currentTime > 30) {
                                avatar.currentTime = 0;
                            }
                        });
                        avatar_block.appendChild(avatar)
                    }; break;
                    default: return
                }
                if (isLinkToPost) {
                    avatar.setAttribute('onclick', `window.location.href='/view?id=${postID}'`)
                    avatar.style.cursor = 'pointer'
                    avatar.title = `${Language.profile.userData.avatarPost} ${postID}`
                }
                avatar_block.appendChild(avatar)
            }
        }
        processAvatar()
        return avatar_block
    }
}

//region snowflakes
function createChristmasSnowflakes() {
    const snowflakesContainer = createDiv('snowflakes', document.querySelector('.norma-page-container'));

    function getDeviceType() {
        const userAgent = navigator.userAgent;

        if (/Mobi|Android/i.test(userAgent)) {
            return 'Mobile';
        } else if (/Tablet|iPad/i.test(userAgent)) {
            return 'Tablet';
        } else {
            return 'Desktop';
        }
    }

    let maxcount = 0
    switch (getDeviceType()) {
        case 'Mobile': {
            maxcount = 30
        }; break;
        case 'Tablet': {
            maxcount = 50
        }; break;
        case 'Desktop': {
            maxcount = 70
        }; break;
    }

    function animateSnowflake() {
        const snowflake = createDiv('snowflake', snowflakesContainer);

        const weight = Math.floor(Math.random() * 4)

        snowflake.innerHTML = ['•', '❅', '❄', '❆'][weight];

        const randPos = Math.random() * 100;
        const randTime = Math.random() * 3 + (7 * (weight + 1));

        let vars = ''
        vars += `--pos-x: ${randPos}%; `
        for (let i = 0; i <= 10; i++) {
            vars += `--pos-x-${i}: ${Math.random() * 1000 - 500}%; `
        }

        vars += `animation: snowFall ${randTime}s linear forwards; `
        const colorGrad = Math.random() * 100 + 155
        vars += `color: rgb(${colorGrad}, ${colorGrad}, 255); `
        vars += `--SF-size: ${Math.random() * 10 + (weight + 1) * 50}%; `
        snowflake.setAttribute('style', vars);

        snowflake.addEventListener('animationend', () => {
            snowflake.remove();
        });
    }

    setInterval(() => {
        if (Array.from(snowflakesContainer.children).length < maxcount) {
            animateSnowflake();
        }
    }, 500);
}


if ([11, 0, 1].includes(new Date().getMonth())) {
    createChristmasSnowflakes();
}

//region celebration
function celebration(text, color) {
    const celebContainer = createDiv('celebration', document.querySelector('body'));
    celebContainer.style.setProperty("--outline-clr", color);
    const html = document.querySelector('html')
    html.style.overflow = 'hidden'

    for (i = 0; i < 300; i++) {
        const confetti = createDiv('confetti', celebContainer)

        const colors = ["red", "blue", "yellow", "green", "purple", "orange"];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const randomX = (Math.random() - 0.5) * 100;
        const randomY = (Math.random() - 0.5) * 100;
        const randomRotate = Math.random() * 360;
        const randomDuration = Math.random() * 4 + 2;

        confetti.style.setProperty("--confetti-color", randomColor);
        confetti.style.setProperty("--random-x", randomX + "vw");
        confetti.style.setProperty("--random-y", randomY + "vh");
        confetti.style.setProperty("--random-rotate", randomRotate + "deg");
        confetti.style.setProperty("--duration", randomDuration + "s");
    }

    const celebText = createDiv('celeb-text', celebContainer)
    celebText.innerText = text.toUpperCase()

    celebContainer.addEventListener('animationend', (e) => {
        if (e.target == celebContainer) {
            html.removeAttribute('style')
            celebContainer.remove()
        }
    })
}

//region try celebrate
function tryCelebration() {
    const celebrations = {
        '03-08': ['happy 8th march!', 'pink'],
        '03-10': ['happy birthday to videomaster!', 'gold'],
        '06-28': ['happy birthday to pi-archive!', 'gold']
    };

    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-CA', { month: '2-digit', day: '2-digit' });
    const storedDate = localStorage.getItem('lastCelebrationDate');

    if (storedDate !== formattedDate) {
        localStorage.removeItem('lastCelebrationShown');
    }

    if (celebrations[formattedDate] && !localStorage.getItem('lastCelebrationShown')) {
        celebration(...celebrations[formattedDate]);
        localStorage.setItem('lastCelebrationShown', 'true');
        localStorage.setItem('lastCelebrationDate', formattedDate);
    }
}

//region RIP
function openRIP() {
    const overlay = createBlurOverlay()
    overlay.addEventListener('click', (e) => {
        if (e.target == overlay) overlay.remove()
    })
    const ripCont = createDiv('rip-cont', overlay)

    const ripTitle = createDiv('rip-title', ripCont)
    ripTitle.innerHTML = 'Rest in peace...'

    const list = [
        { date: 2025, name: "Кіт Сьома" }
    ]

    for (const item of list) {
        const itemCont = createDiv('rip-line', ripCont)
        itemCont.innerHTML = `${item.date} - ${item.name}`
    }
}