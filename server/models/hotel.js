var mongoose = require('mongoose');

module.exports = function(){
    var hotelSchema = mongoose.Schema({
        EANHotelID: Number,
        SequenceNumber: Number,
        Name: String,
        Address1: String,
        Address2: String,
        City: String,
        StateProvince: String,
        PostalCode: String,
        Country: String,
        Latitude: Number,
        Longitude: Number,
        AirportCode: String,
        PropertyCategory:  Number,
        PropertyCurrency: String,
        StarRating: Number,
        Confidence: Number,
        SupplierType: String,
        Location: String,
        ChainCodeID: Number,
        RegionID: Number,
        HighRate: Number,
        LowRate: Number,
        CheckInTime: Number,
        CheckOutTime: Number
    });
    var Hotel = mongoose.model('Hotel', hotelSchema);
};