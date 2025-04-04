async function createTagGroupList() {
    const tagCLang = Language.admin.tagsControl
    const tagGroupResult = await request('controlTagGroups', { type: 'getAllGroups' })
    if (DEVMODE) console.log(tagGroupResult)

    const langResult = await request('getLangsList')
    const langlist = []
    for (const lng of langResult.langs) {
        langlist.push({ name: lng.name, id: lng.id })
    }

    const tagGroupList = tagGroupResult.groups

    const tagGroupListBlock = document.getElementById('tag-groups-list')

    for (const tagGroup of tagGroupList.sort((a, b) => b.priority - a.priority)) {
        const tag_group_div = createDiv('tag-group-continer', tagGroupListBlock)

        const header = createDiv('head-bar', tag_group_div)
        const content = createDiv('tag-bar', tag_group_div)
        const buttons = createDiv('button-bar', tag_group_div)

        const groupNameCont = createDiv('group-name', header)
        createDiv('label', groupNameCont).innerHTML = tagCLang.groupN

        const langNamesCont = createDiv('lang-names-cont', groupNameCont)

        const nameFields = {}

        function getNames() {
            const names = {}
            for (const field in nameFields) {
                names[field] = nameFields[field].value
            }
            return names
        }

        for (const lang of langlist) {
            const input = document.createElement('input')
            langNamesCont.appendChild(input)
            input.type = 'text'
            input.placeholder = lang.name
            nameFields[lang.id] = input
        }

        if (typeof tagGroup.groupname != 'object') {
            nameFields.ENG.value = tagGroup.groupname
            console.log('Fallback to english name triggered for ' + tagGroup.groupname + ' tag group')
        } else {
            for (const lngnm in tagGroup.groupname) {
                nameFields[lngnm].value = tagGroup.groupname[lngnm]
            }
        }

        // const name = document.createElement('input')
        // name.type = 'text'
        // groupNameCont.appendChild(name)

        const priorityCont = createDiv('priority', header)
        priorityCont.innerHTML = tagCLang.prior + ': '
        const priority = document.createElement('input')
        priority.type = 'text'
        priorityCont.appendChild(priority)

        const colorCont = createDiv('color', header)
        colorCont.innerHTML = tagCLang.color + ': '
        const color = document.createElement('input')
        color.type = 'color'
        colorCont.appendChild(color)

        name.value = tagGroup.groupname
        priority.value = tagGroup.priority
        color.value = tagGroup.color

        let localtags = []

        function createTagElem(tag, rmcb) {
            const tagContainer = createDiv('tag-container')
            const tagName = createDiv('name', tagContainer)
            tagName.innerText = tag
            localtags.push(tag)

            const removeTagBtn = createAction('✖', tagContainer, () => {
                localtags = localtags.filter(val => val != tag)
                tagContainer.classList.add('deleted')
                tagContainer.classList.remove('new')
                removeTagBtn.remove()
                rmcb()
            })

            return tagContainer
        }

        for (const tag of tagGroup.relatedtags) {
            const tagElem = createTagElem(tag)
            content.appendChild(tagElem)
        }

        const add_btn = createAction('+', content, async () => {
            const notf = new Notify(tagCLang.insrtTagName, null, '#0f0', 'inputLong', (newTagsLine) => {
                if (!newTagsLine) return
                const newTagsArray = newTagsLine.split(/\s+|\n+/).filter(val => val !== '')
                for (const tagname of newTagsArray) {
                    const tagElem = createTagElem(tagname, () => {
                        tagElem.remove()
                    })
                    content.insertBefore(tagElem, add_btn)
                    tagElem.classList.add('new')
                }
            })
            addTagsAutofill(notf.inputField, notf.textInputContainer, true)
        })

        add_btn.classList.add('plus')

        const remove_btn = createButton(tagCLang.del.btn, buttons)
        const cancel_btn = createButton(tagCLang.canc, buttons)
        const confirm_btn = createButton(tagCLang.acc.btn, buttons)

        remove_btn.style.backgroundColor = 'red'
        remove_btn.addEventListener('click', async () => {
            new Notify(`${tagCLang.del.q} "${tagGroup.groupname}"?`, null, '#f00', 'inputConfirm', async (result) => {
                if (result) {
                    const rmResult = await request('controlTagGroups', { type: 'removeGroup', groupName: tagGroup.groupname })
                    window.location.href = window.location.href + `?alert=${rmResult.rslt}/${rmResult.msg}`
                }
            })
        })


        cancel_btn.addEventListener('click', () => {
            window.location.reload()
        })

        confirm_btn.addEventListener('click', async () => {
            new Notify(`${tagCLang.acc.q} "${getNames().ENG}"?`, null, '#ff0', 'inputConfirm', async (result) => {
                if (result) {
                    const newGroupData = {
                        groupname: getNames(),
                        priority: priority.value,
                        color: color.value,
                        relatedtags: localtags
                    }

                    const conf_result = await request('controlTagGroups', { type: 'updateGroup', groupID: tagGroup.id, newGroupData: newGroupData })
                    if (conf_result.rslt == 's')
                        window.location.href = window.location.href + `?alert=${conf_result.rslt}/${conf_result.msg}`
                    alert(`${conf_result.rslt}/${conf_result.msg}`, 5000)
                }
            })
        })
    }

    const crGroupCont = document.querySelector('.create-group-container')

    const newTagGropName = document.createElement('input')
    crGroupCont.appendChild(newTagGropName)
    newTagGropName.type = 'text'
    newTagGropName.placeholder = tagCLang.NG.ngn

    const crNewGroupBtn = createButton(tagCLang.NG.cr, crGroupCont)

    crNewGroupBtn.addEventListener('click', async () => {
        new Notify(`${tagCLang.NG.q} "${newTagGropName.value}"`, null, '#ff0', 'inputConfirm', async (result) => {
            if (result) {
                const crResult = await request('controlTagGroups', { type: 'createGroup', groupName: newTagGropName.value })
                window.location.href = window.location.href + `?alert=${crResult.rslt}/${crResult.msg}`
            }
        })
    })
}
createTagGroupList()