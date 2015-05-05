var detailsController = require('../controllers/hotelDetails');

module.exports = function(app){
    app.get('/api/hotel/information/:hotelId', function(req, res){
        var hotelId = req.params.hotelId;
        detailsController.getHotelDetails(hotelId, res);
    });
};