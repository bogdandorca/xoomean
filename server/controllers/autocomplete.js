var mongoose = require('mongoose'),
    async = require('async'),
    Autocomplete = mongoose.model('Autocomplete');

module.exports = {
    streamAutocompleteData: function(destination, type, callback){
        var dataArray = [];
        var stream = Autocomplete.find({Name: {$regex: destination}, Type: type}).sort({Popularity: -1}).limit(5).stream();
        stream.on('data', function(data){
            dataArray.push(data);
        });
        stream.on('error', function(err){
            console.log(err);
        });
        stream.on('close', function(){
            callback(false, dataArray);
        });
    },
    getAutocompleteData: function(destination, res){
        var regDest = new RegExp(destination, 'i');
        var parent = this;
        async.parallel([
                function(callback){
                    parent.streamAutocompleteData(regDest, "hotel", callback);
                },
                function(callback){
                    parent.streamAutocompleteData(regDest, "city", callback);
                },
                function(callback){
                    parent.streamAutocompleteData(regDest, "airport", callback);
                }
            ],
            function(err, results){
                if(err){
                    res.send("Error");
                } else {
                    for(var i=0;i<results[1].length;i++){
                        results[0].push(results[1][i]);
                    }
                    for(var i=0;i<results[2].length;i++){
                        results[0].push(results[2][i]);
                    }
                    res.send(results[0]);
                }
            });
    }
};