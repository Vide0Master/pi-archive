async function createTagGroupList() {
    const tagGroupResult = await request('controlTagGroups', { type: 'getAllGroups' })
    if (DEVMODE) console.log(tagGroupResult)

    const tagGroupList = tagGroupResult.groups

    const tagGroupListBlock = document.getElementById('tag-groups-list')

    for (const tagGroup of tagGroupList.sort((a,b)=>b.priority-a.priority)) {
        const tag_group_div = createDiv('tag-group-continer', tagGroupListBlock)

        const header = createDiv('head-bar', tag_group_div)
        const content = createDiv('tag-bar', tag_group_div)
        const buttons = createDiv('button-bar', tag_group_div)

        const groupNameCont = createDiv('group-name', header)
        groupNameCont.innerHTML = 'Имя группы: '
        const name = document.createElement('input')
        name.type = 'text'
        groupNameCont.appendChild(name)

        const priorityCont = createDiv('priority', header)
        priorityCont.innerHTML = 'Приоритет: '
        const priority = document.createElement('input')
        priority.type = 'text'
        priorityCont.appendChild(priority)

        const colorCont = createDiv('color', header)
        colorCont.innerHTML = 'Цвет группы: '
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
            const newTagsLine = await showPopup('Введите название тега')
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

        add_btn.classList.add('plus')

        const remove_btn = createButton('Удалить', buttons)
        const cancel_btn = createButton('Отменить', buttons)
        const confirm_btn = createButton('Применить', buttons)

        remove_btn.style.backgroundColor = 'red'
        remove_btn.addEventListener('click', async () => {
            if (!confirm(`Вы уверены в удалении группы "${tagGroup.groupname}"?`)) return

            const rmResult = await request('controlTagGroups', { type: 'removeGroup', groupName: tagGroup.groupname })

            window.location.href = window.location.href + `?alert=${rmResult.rslt}/${rmResult.msg}`
        })


        cancel_btn.addEventListener('click', () => {
            window.location.reload()
        })

        confirm_btn.addEventListener('click', async () => {
            if (!confirm(`Вы уверены в обновлении тегов группы "${tagGroup.groupname}"?`)) return
            const newGroupData = {
                groupname: name.value,
                priority: priority.value,
                color: color.value,
                relatedtags: localtags
            }

            const conf_result = await request('controlTagGroups', { type: 'updateGroup', group: tagGroup.groupname, newGroupData: newGroupData })
            if(conf_result.rslt=='s')
                window.location.href = window.location.href + `?alert=${conf_result.rslt}/${conf_result.msg}`
            alert(`${conf_result.rslt}/${conf_result.msg}`, 5000)
        })
    }

    const crGroupCont = document.querySelector('.create-group-container')

    const newTagGropName = document.createElement('input')
    crGroupCont.appendChild(newTagGropName)
    newTagGropName.type = 'text'
    newTagGropName.placeholder = 'Имя группы'

    const crNewGroupBtn = createButton('Создать группу тегов', crGroupCont)

    crNewGroupBtn.addEventListener('click', async () => {
        if (!confirm(`Вы уверены в создании новой группы "${newTagGropName.value}"?`)) return

        const crResult = await request('controlTagGroups', { type: 'createGroup', groupName: newTagGropName.value })
        window.location.href = window.location.href + `?alert=${crResult.rslt}/${crResult.msg}`
    })
}
createTagGroupList()