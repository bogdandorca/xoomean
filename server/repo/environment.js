var jade = require('jade'),
    bodyParser= require('body-parser');

module.exports = function(app, express){
    // Public views
    app.set('views', './public/');
    app.set('view engine', 'jade');
    app.use(express.static('./public'));

    app.use(bodyParser.json({extended: true}));

    app.get('/partials/*', function(req, res){
        res.render('./partials/'+req.params[0]);
    });
};