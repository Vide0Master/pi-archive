function createReg() {
    const element_list = {
        username: { name: 'Никнейм', type: 'text' },
        login: { name: 'Логин', type: 'text' },
        password: { name: 'Пароль', type: 'password' },
        password_conf: { name: 'Подтвердить пароль', type: 'password' },
        admin_message: { name: 'Сообщение администратору', type: 'textarea' }
    }

    const limits = {
        username: { min: 4, max: 40, restrSymbols: undefined, isError: false },
        login: { min: 4, max: 30, restrSymbols: '!=-+&*()^%', isError: false },
        password: { min: undefined, max: undefined, restrSymbols: undefined, isError: false },
        password_conf: { min: undefined, max: undefined, restrSymbols: undefined, isError: false },
        admin_message: { min: 10, max: 200, restrSymbols: undefined, isError: false }
    }



    const input_container = document.querySelector('.userdata')

    for (const elem in element_list) {
        const elem_container = createDiv('input-container')

        const elem_data = element_list[elem]
        let data_elem
        switch (elem_data.type) {
            case 'text': {
                data_elem = document.createElement('input')
                data_elem.type = 'text'
            }; break;
            case 'password': {
                data_elem = document.createElement('input')
                data_elem.type = 'password'
            }; break;
            case 'textarea': {
                data_elem = document.createElement('textarea')
            }; break;
        }
        data_elem.placeholder = elem_data.name
        elem_container.appendChild(data_elem)
        input_container.append(elem_container)
        element_list[elem] = data_elem

        const stupid_overlay = createDiv('stupid-overlay')
        elem_container.appendChild(stupid_overlay)
        stupid_overlay.style.display = 'none'

        data_elem.addEventListener('focusin', () => {
            stupid_overlay.removeAttribute('style')
        })

        const checkFields = []

        checkFields.push(function resetErr() {
            limits[elem].isError = false
        })

        if (limits[elem].min && !['password', 'password_conf', 'admin_message'].includes(elem)) {
            const min_test = createDiv('check')
            min_test.innerText = `Минимум символов ${limits[elem].min}`
            min_test.style.display = 'inline'
            min_test.style.color = 'red'
            function check(val) {
                if (val.length < limits[elem].min) {
                    min_test.style.display = 'inline'
                    limits[elem].isError = true
                } else {
                    min_test.style.display = 'none'
                }
            }
            checkFields.push(check)
            stupid_overlay.appendChild(min_test)
        }

        if (limits[elem].max && !['password', 'password_conf', 'admin_message'].includes(elem)) {
            const max_test = createDiv('check')
            max_test.innerText = `Максимум символов ${limits[elem].max}`
            max_test.style.display = 'inline'
            max_test.style.color = 'red'
            function check(val) {
                if (val.length > limits[elem].max) {
                    max_test.style.display = 'inline'
                    limits[elem].isError = true
                } else {
                    max_test.style.display = 'none'
                }
            }
            checkFields.push(check)
            stupid_overlay.appendChild(max_test)
        }

        if (limits[elem].restrSymbols && !['password', 'password_conf', 'admin_message'].includes(elem)) {
            const restr_symbols = createDiv('check')
            function check(val) {
                restr_symbols.innerText = 'Использованы запрещённые символы:'
                const restr_symbols_arr = []
                for (const symb of val.split('')) {
                    if (limits[elem].restrSymbols.split('').includes(symb)) {
                        restr_symbols_arr.push(symb)
                    }
                }
                if (restr_symbols_arr.length > 0) {
                    restr_symbols.style.display = 'inline'
                    restr_symbols.innerText += " " + restr_symbols_arr.join(', ')
                    limits[elem].isError = true
                } else {
                    restr_symbols.style.display = 'none'
                }
            }
            checkFields.push(check)
            stupid_overlay.appendChild(restr_symbols)
        }

        if (elem == 'password') {
            function min_length() {
                const length_check = createDiv('check')
                length_check.innerText = `Минимум 6 символов`
                length_check.style.display = 'inline'
                length_check.style.color = 'red'
                function check(val) {
                    if (val.length < 6) {
                        length_check.style.display = 'inline'
                        limits[elem].isError = true
                    } else {
                        length_check.style.display = 'none'
                    }
                }
                checkFields.push(check)
                stupid_overlay.appendChild(length_check)
            }
            min_length()

            function countDigitsAndNonDigits(str) {
                let digitCount = 0;
                let nonDigitCount = 0;

                for (let char of str) {
                    if (/\d/.test(char)) {
                        digitCount++;
                    } else {
                        nonDigitCount++;
                    }
                }

                return { digits: digitCount, nonDigits: nonDigitCount };
            }

            function checkMinNubmers() {
                const min_num_check = createDiv('check')
                function check(val) {
                    const count = countDigitsAndNonDigits(val).digits

                    if (count < 2) {
                        min_num_check.innerText = `Минимум 2 цифры`
                        min_num_check.style.display = 'inline'
                        min_num_check.style.color = 'red'
                        limits[elem].isError = true
                    } else if (count < 4) {
                        min_num_check.innerText = `Рекомендовано минимум 4 цифры`
                        min_num_check.style.display = 'inline'
                        min_num_check.style.color = 'orange'
                    } else {
                        min_num_check.style.display = 'none'
                    }
                }
                checkFields.push(check)
                stupid_overlay.appendChild(min_num_check)
            }
            checkMinNubmers()

            function checkMinSymb() {
                const min_symb_check = createDiv('check')
                function check(val) {
                    const count = countDigitsAndNonDigits(val).nonDigits
                    if (count < 2) {
                        min_symb_check.innerText = `Минимум 2 не цифровых символа`
                        min_symb_check.style.display = 'inline'
                        min_symb_check.style.color = 'red'
                        limits[elem].isError = true
                    } else if (count < 4) {
                        min_symb_check.innerText = `Рекомендовано минимум 4 не цифровых символа`
                        min_symb_check.style.display = 'inline'
                        min_symb_check.style.color = 'orange'
                    } else {
                        min_symb_check.style.display = 'none'
                    }
                }
                checkFields.push(check)
                stupid_overlay.appendChild(min_symb_check)
            }
            checkMinSymb()
        }

        if (elem == 'password_conf') {
            const pass_conf = createDiv('check')
            pass_conf.innerText = `Пароли не совпадают`
            pass_conf.style.display = 'inline'
            pass_conf.style.color = 'red'
            function check(val) {
                if (val != element_list.password.value) {
                    pass_conf.style.display = 'inline'
                    limits[elem].isError = true
                } else {
                    pass_conf.style.display = 'none'
                }
            }
            checkFields.push(check)
            stupid_overlay.appendChild(pass_conf)
        }

        if (elem == 'admin_message') {
            const msgWords = () => {
                return data_elem.value.split(/\n|\s/).filter(word => word != '')
            }

            function check_min_words() {
                const words_check = createDiv('check')
                words_check.innerText = `Минимум 10 слов`
                words_check.style.display = 'inline'
                words_check.style.color = 'red'
                function check() {
                    if (msgWords().length < 10) {
                        words_check.style.display = 'inline'
                        limits[elem].isError = true
                    } else {
                        words_check.style.display = 'none'
                    }
                }
                checkFields.push(check)
                stupid_overlay.appendChild(words_check)
            }
            check_min_words()

            function check_restr_words() {
                const prohibitedPatterns = [
                    // Русский
                    /хуй/i, /бляд/i, /еба/i, /сука/i, /пидор/i, /гондон/i, /ебан/i, /мудак/i, /твар/i, /пизд/i, /жоп/i, /дроч/i, /шлюх/i, /мраз/i, /чмо/i, /залуп/i, /хуес/i, /гавн/i, /сос/i, /нах/i, /трах/i, /пидорас/i, /шмар/i, /сукин/i, /выеб/i, /хуёв/i, /ублюд/i, /отсос/i, /отсоси/i, /хер/i, /манда/i, /проститут/i, /сволоч/i, /скотин/i, /говнюк/i,
                    // Український
                    /хуй/i, /бляд/i, /єба/i, /сука/i, /підор/i, /гандон/i, /єбан/i, /мудак/i, /твар/i, /пизд/i, /срак/i, /дроч/i, /шльонд/i, /мраз/i, /чмо/i, /залуп/i, /хуєс/i, /гівн/i, /ссати/i, /нах/i, /трах/i, /підорас/i, /шмар/i, /сукин/i, /виїб/i, /хуєв/i, /ублюд/i, /відсос/i, /відсоси/i, /хер/i, /манда/i, /проститут/i, /сволот/i, /скотин/i, /гівнюк/i,
                    // English
                    /fuck/i, /shit/i, /asshole/i, /bitch/i, /bastard/i, /cunt/i, /dick/i, /pussy/i, /cock/i, /whore/i, /slut/i, /faggot/i, /motherfuck/i, /nigger/i, /damn/i, /crap/i, /douche/i, /prick/i, /twat/i, /wanker/i, /dildo/i, /bollocks/i, /bugger/i, /arsehole/i, /screw/i, /blowjob/i, /jackass/i, /jerk/i, /moron/i, /idiot/i, /retard/i, /freak/i, /loser/i, /nerd/i, /dipshit/i, /piss/i, /tosser/i, /scumbag/i, /nutcase/i, /wuss/i, /wimp/i, /dumbass/i, /pecker/i, /buttfuck/i, /ballbag/i
                ];

                function containsProhibitedWord(text) {
                    return prohibitedPatterns.some(pattern => pattern.test(text));
                }
                const words_check = createDiv('check')

                function check() {
                    const detected_restrictions = []

                    for (const word of msgWords()) {
                        if (containsProhibitedWord(word.toLowerCase())) {
                            detected_restrictions.push(word)
                        }
                    }

                    if (detected_restrictions.length > 0) {
                        words_check.innerText = 'Использованы запрещённые слова: '
                        words_check.style.color = 'red'
                        words_check.innerText += ' ' + detected_restrictions.join(', ')
                        words_check.style.display = 'inline'
                        limits[elem].isError = true
                    } else {
                        words_check.style.display = 'none'
                    }
                }
                checkFields.push(check)
                stupid_overlay.appendChild(words_check)
            }
            check_restr_words()
        }

        const is_ok = createDiv('check')
        stupid_overlay.appendChild(is_ok)
        is_ok.innerText = 'Всё верно!'
        is_ok.style.color = 'green'
        is_ok.style.display = 'none'
        checkFields.push(function check() {
            if (limits[elem].isError) {
                is_ok.style.display = 'none'
            } else {
                is_ok.style.display = 'inline'
            }
        })

        for (const chk of checkFields) {
            chk(data_elem.value)
        }

        data_elem.addEventListener('input', () => {
            const field_value = data_elem.value

            for (const check of checkFields) {
                check(field_value)
            }
        })

        data_elem.addEventListener('focusin', () => {
            const field_value = data_elem.value

            for (const check of checkFields) {
                check(field_value)
            }
        })
    }

    document.getElementById('send').addEventListener('click', async () => {
        const userdat = {}
        for (const elm in element_list) {
            userdat[elm] = element_list[elm].value
            if (elm == 'password') {
                userdat[elm] = await hashPassword(userdat[elm])
            }
        }
        const reslt = await request('register', userdat)
        alert(reslt.rslt + '/' + reslt.msg, 5000)
    })
}

function hashPassword(password) {
    return CryptoJS.SHA256(password).toString();
}

createReg()

