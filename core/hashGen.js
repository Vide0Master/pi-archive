const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz0123456789".split('')

module.exports = (hash_length) => {
    const key_length = hash_length    
    let key = ''
    for (let i = 0; i < key_length; i++) {
        key += alphabet[Math.floor(Math.random() * alphabet.length)]
    }
    return key
}