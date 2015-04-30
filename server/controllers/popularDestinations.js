var mongoose = require('mongoose'),
    Autocomplete = mongoose.model('Autocomplete');

module.exports = {
    getMostPopularDestinations: function(numberOfResults, res){
        var popularDestinationsSelection = [];
        var stream = Autocomplete.find({Type: 'city'}).sort({Popularity: -1}).limit(numberOfResults).stream();
        stream.on('data', function(data){
            popularDestinationsSelection.push(data);
        });
        stream.on('error', function(err){
            console.log(err);
        });
        stream.on('close', function(){
            res.send(popularDestinationsSelection);
        });
    },
    indentSelections: function(destinationId){
        Autocomplete.findOne({DestinationId: destinationId}).exec(function(err, data){
            if(!err && data !== null){
                data.Selections += 1;

                var destination = data.toObject();
                delete destination['_id'];
                delete destination['DestinationId'];

                Autocomplete.update({DestinationId: destinationId}, destination, function(err, affected, resp){

                });
            }
        });
    }
};