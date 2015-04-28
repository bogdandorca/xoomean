var jade = require('jade');

module.exports = function(app, express){
    // Public views
    app.set('views', './public/');
    app.set('view engine', 'jade');
    app.use(express.static('./public'));

    app.get('/', function(req, res){
        res.render('index');
    });
    app.get('/partials/*', function(req, res){
        res.render('./partials/'+req.params[0]);
    });
    app.get('*', function(req, res){
        res.end();
    });
};