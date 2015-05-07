var itineraryController = require('../controllers/itinerary');

module.exports = function(app){
    app.get('/api/itinerary/:itineraryNumber/:email', function(req, res){
        var itineraryNumber = req.params.itineraryNumber,
            email = req.params.email;
        itineraryController.getItinerary(itineraryNumber, email, res);
    });
};