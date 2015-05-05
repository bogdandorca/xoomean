var availController = require('../controllers/avail');

module.exports = function(app){
    app.get('/api/avail/:hotelId/:checkIn/:checkOut', function(req, res){
        // TODO: set as global
        String.prototype.standardizeDate = function(){
            var dateArr = this.split('-');
            return dateArr[1]+'/'+dateArr[0]+'/'+dateArr[2];
        };
        var hotelId = req.params.hotelId;
        var checkIn = req.params.checkIn.standardizeDate();
        var checkOut = req.params.checkOut.standardizeDate();
        availController.getRoomAvailability(hotelId, checkIn, checkOut, res);
    });
};