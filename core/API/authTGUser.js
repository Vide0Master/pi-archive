const syscontroller = require('../systemController.js')

module.exports = (request) => {
    return new Promise(async resolve => {
        const user_perm = await syscontroller.dbinteract.getUserPermission(request.userKey)
        if (user_perm == 0) {
            resolve({ rslt: 'e', msg: '{{TB_AUTH_NU}}' })
        } else {
            const id_set_rslt = syscontroller.dbinteract.setTGIDForUser(request.userKey,request.TGID)
            if(id_set_rslt.rslt == 'e'){
                resolve({msg:`{{TB_AUTH_E}}: ${id_set_rslt.msg}`})
            }else{
                resolve({msg:`{{TB_AUTH_S}}!`,userdata: await syscontroller.dbinteract.getUserByKey(request.userKey)})
            }
        }
    })
}