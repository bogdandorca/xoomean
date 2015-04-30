var popularController = require('../controllers/popularDestinations');

module.exports = function(app){
    app.get('/api/popular/:limit', function(req, res){
        var numberOfResults = req.params.limit;
        popularController.getMostPopularDestinations(numberOfResults, res);
    });
    app.post('/api/popular/:destinationId', function(req, res){
        var destinationId = req.params.destinationId;
        popularController.indentSelections(destinationId);
        res.end();
    });
};