var mongoose = requre('mongoose');

module.exports = function(){
    var airportSchema = mongoose.Schema({
        AirportID: Number,
        AirportCode: String,
        AirportName: String,
        Latitude: Number,
        Longitude: Number,
        MainCityID: String,
        CountryCode: String
    });
    var Airport = mongoose.model('Airport', airportSchema);
};