var listCtrl = require('../controllers/list');

module.exports = function(app){
    app.get('/api/list/:type/:destinationId/:checkIn/:checkOut/:offset', function(req, res){
        var type = req.params.type,
            id = req.params.destinationId,
            checkIn = req.params.checkIn,
            checkOut = req.params.checkOut,
            offset = req.params.checkOut;
        listCtrl.getHotelsByDestination(id, checkIn, checkOut, res);
    });
};