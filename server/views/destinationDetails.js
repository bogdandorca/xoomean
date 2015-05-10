var destinationCtrl = require('../controllers/destinationDetails');

module.exports = function(app){
    app.get('/api/destination/details/:destinationId', function(req, res){
        var destinationId = req.params.destinationId;
        destinationCtrl.getDestinationNameById(destinationId, res);
    });
};