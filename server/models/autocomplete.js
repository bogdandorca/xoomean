var mongoose = require('mongoose');

module.exports = function(){
    var autocompleteSchema = mongoose.Schema({
        Name: String,
        DestinationId: String,
        Type: String,
        Selections: Number,
        Popularity: Number
    });
    var Autocomplete = mongoose.model('Autocomplete', autocompleteSchema);
};