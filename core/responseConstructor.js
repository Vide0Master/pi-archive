
module.exports = class Response {
    /**
     * Response constructor.
     * @param {'s'|'e'|'w'|'i'} Type - Response type.
     * - `s`: Success
     * - `e`: Error
     * - `w`: Warning
     * - `i`: Info
     * @param {string} Message - response message.
     * @param {object} Data - response data.
     * - input `rslt`, `msg`, `data`, `err`, `errmsg` - will rewrite existing variables
     * @param {object|string} [Err] - Error object.
     * @param {('Error ...')} [ErorMessage] - Error text.
     */
    constructor(Type = '', Message = '', Data = {}, Err = null, ErorMessage = '') {

        this.rslt = Type;

        this.msg = Message;

        this.err = Err

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
}
