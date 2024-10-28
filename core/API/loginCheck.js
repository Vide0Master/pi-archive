module.exports = (request, user) => {
    return new Promise(async resolve => {
        if (!user) {
            resolve({ rslt: 'e' })
        } else {
            resolve({ rslt: 's' })
        }
    })
}