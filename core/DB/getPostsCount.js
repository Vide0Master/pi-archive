const SysController = require('../systemController');

module.exports = (db, queryText, override) => {
    return new Promise((resolve) => {
        let query = 'SELECT COUNT(*) as count';

        const { Cquery, params } = SysController.queryConstructor(queryText, undefined, undefined, override)

        db.get(query + Cquery, params, (err, row) => {
            if (err) SysController.log('e/' + err)
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
