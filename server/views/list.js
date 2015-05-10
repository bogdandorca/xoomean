var listCtrl = require('../controllers/list');

module.exports = function(app){
    app.get('/api/list/:type/:destinationId/:checkIn/:checkOut/:offset', function(req, res){
        String.prototype.standardizeDate = function(){
            var dateArr = this.split('-');
            return dateArr[1]+'/'+dateArr[0]+'/'+dateArr[2];
        };

        var type = req.params.type,
            id = req.params.destinationId,
            checkIn = req.params.checkIn.standardizeDate(),
            checkOut = req.params.checkOut.standardizeDate(),
            offset = req.params.checkOut;
        if(type==='city'){
            listCtrl.getHotelsByDestination(id, checkIn, checkOut, res);
        } else if(type==='airport'){
            listCtrl.getHotelsByAirport(id, checkIn, checkOut, res);
        } else if(type==='hotel'){
            listCtrl.getHotelsById(id, checkIn, checkOut, res);
        } else {
            res.send('Error');
        }
    });
};