const SysController = require('../systemController');

module.exports = (db, queryText, from, posts) => {
    return new Promise((resolve) => {
        let query = 'SELECT * FROM posts';

        const { Cquery, params } = SysController.queryConstructor(queryText, from, posts)

        db.all(query + Cquery, params, (err, rows) => {
            resolve(new SysController.createResponse(
                's',
                'Got post list',
                { posts: rows },
                err,
                'Error getting posts list'
            ))
        });
    });
};