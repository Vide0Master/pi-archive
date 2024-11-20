const SysController = require('../systemController');

module.exports = (db, queryText) => {
    return new Promise((resolve) => {
        let query = 'SELECT COUNT(*) as count FROM posts';

        const { Cquery, params } = SysController.queryConstructor(queryText)

        db.get(query + Cquery, params, (err, row) => {
            resolve(new SysController.createResponse(
                's',
                'Got post count',
                { count: row.count },
                err,
                'Error while getting post count'
            ))
        });
    });
}
