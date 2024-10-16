const sysController = require('../systemController')

module.exports = (db, user) => {
    return new Promise(async resolve => {
        db.all(`
            SELECT "to", "from" FROM messages 
            WHERE ("to" = ? OR "from" = ?) AND "msgtype" = "DM"
            ORDER BY timestamp DESC`,
            [user, user],
            (err, rows) => {
                if (err) {
                    sysController.log(`e/Ошибка получения сообщений [getUserMessages]: ${err}`)
                    resolve({ rslt: 'e', msg: err })
                } else {
                    const logins = new Set(); // Используем Set для уникальности логинов
                    rows.forEach(row => {
                        if (row.to === user) {
                            logins.add(row.from); // Если сообщение пришло пользователю, добавляем отправителя
                        } else if (row.from === user) {
                            logins.add(row.to); // Если сообщение от пользователя, добавляем получателя
                        }
                    });
                    resolve([...logins]); // Преобразуем Set в массив и возвращаем
                }
            }
        );
    });
}
