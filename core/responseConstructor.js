/**
 * Класс создан для стандартизации системных ответов.
 */
module.exports = class Response {
    /**
     * Создаёт конструкцию ответа.
     * @param {'s'|'e'|'w'|'i'} Type - Тип ответа.
     * - `s`: Успех
     * - `e`: Ошибка
     * - `w`: Предупреждение
     * - `i`: Информация
     * @param {string} Message - Текстовое сообщение ответа.
     * @param {object} Data - Данные для ответа.
     * - Введение `rslt`, `msg`, `data`, `err`, `errmsg` - перезапишет существующие переменные
     * @param {object|string} [Err] - Ошибка для ответа.
     * @param {('Ошибка ...')} [ErorMessage] - Текст для ошибки.
     */
    constructor(Type = '', Message = '', Data = {}, Err = null, ErorMessage = '') {
        /**
         * @type {'s'|'e'|'w'|'i'}
         * @description Тип ответа.
         */
        this.rslt = Type;

        /**
         * @type {string}
         * @description Текстовое сообщение.
         */
        this.msg = Message;

        /**
         * @type {object|string}
         * @description Данные ошибки.
         */
        this.err = Err

        /**
         * @type {string}
         * @description Текст ошибки.
         */
        this.errmsg = ErorMessage
        if (this.err) {
            this.msg = this.errmsg + ": " + this.err;
            this.rslt = 'e';
        } else {
            delete this.err
            delete this.errmsg
        }

        if (Data)
            for (const dline in Data)
                this[dline] = Data[dline];
    }

    /**
     * Проверяет, является ли ответ ошибкой.
     * @returns {boolean} True, если ответ является ошибкой.
     */
    static isErr() {
        return this.rslt == 'e';
    }

    /**
     * Проверяет, не является ли ответ ошибкой.
     * @returns {boolean} True, если ответ не является ошибкой.
     */
    static isNotErr() {
        return this.rslt != 'e';
    }

    /**
     * Проверяет, является ли ответ успешным.
     * @returns {boolean} True, если ответ является успешным.
     */
    static isSucc() {
        return this.rslt == 's';
    }

    /**
     * Обновляет поле ответа новым значением.
     * @param {string} field - Имя поля.
     * @param {*} value - Новое значение поля.
     */
    static update(field, value) {
        this[field] = value;
    }
}
