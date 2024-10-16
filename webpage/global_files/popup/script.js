function showPopup(title = 'Title', defaultText = '') {
    return new Promise((resolve, reject) => {
        // Create background blur element
        const blurryBackground = createBlurOverlay()

        // Create popup container
        const popup = document.createElement('div')
        popup.className = 'popup'

        // Create title
        const popupTitle = document.createElement('h2')
        popupTitle.textContent = title

        // Create textarea
        const textarea = document.createElement('textarea')
        textarea.value = defaultText

        const btn_row = createDiv('button_row')

        const btnD = createButton('Отмена')
        btn_row.appendChild(btnD)
        const btnC = createButton('Принять')
        btn_row.appendChild(btnC)

        btnC.addEventListener('click', () => {
            closePopup()
            const text = textarea.value
            if (text != defaultText) {
                resolve(text)
            } else {
                reject(false)
            }
        })

        btnD.addEventListener('click', () => {
            closePopup()
            reject(false)
        })

        // Append elements to popup
        popup.appendChild(popupTitle)
        popup.appendChild(textarea)
        popup.appendChild(btn_row)
        blurryBackground.appendChild(popup)

        // Function to close popup
        function closePopup() {
            document.body.removeChild(blurryBackground)
        }

        // Close popup on background click
        blurryBackground.addEventListener('click', (event) => {
            if (event.target === blurryBackground) {
                closePopup()
                reject(false)
            }
        });

        // Focus textarea
        textarea.focus()
        document.body.classList.add('blurred')
    });
}