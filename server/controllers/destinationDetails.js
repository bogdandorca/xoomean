var mongoose = require('mongoose'),
    Autocomplete = mongoose.model('Autocomplete');

module.exports = {
    getDestinationNameById: function(destinationId, res){
        Autocomplete.findOne({DestinationId: destinationId}, function(err, destination){
            if(!err){
                res.send(destination);
            } else {
                res.end();
            }
        });
    }
};