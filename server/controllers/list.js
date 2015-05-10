var mongoose = require('mongoose'),
    async = require('async')
    request = require('request'),
    Hotel = mongoose.model('Hotel');

module.exports = {
    formatHoteListRequest: function(hotelList, checkIn, checkOut){
        var baseUrl = ' http://api.ean.com/ean-services/rs/hotel/v3/list?cid=55505&minorRev=99&apiKey=kjfeed6zwcy2k4ag24v9ugp5&locale=en_US&currencyCode=USD';
        baseUrl += '&hotelIdList='+encodeURIComponent(hotelList);
        baseUrl += '&arrivalDate='+encodeURIComponent(checkIn)+'&departureDate='+encodeURIComponent(checkOut);
        baseUrl += '&numberOfResults=24&&room1=2';

        return baseUrl;
    },
    sendEanRequest: function(url, res){
        request(url, function(err, resp, body){
            if(!err){
                res.send(body);
            } else {
                res.send(err);
            }
        });
    },
    getHotelAvailability: function(hotelList, checkIn, checkOut, res){
        var url = this.formatHoteListRequest(hotelList, checkIn, checkOut);
        this.sendEanRequest(url, res);
    },
    getHotelsByDestination: function(destinationId, checkIn, checkOut, res){
        var hotelIdList = [];
        var parent = this;
        var stream = Hotel.find({RegionID: destinationId}).limit(100).stream();
        stream.on('data', function(data){
            hotelIdList.push(data.EANHotelID);
        });
        stream.on('error', function(err){
            console.log('Error: ' + err);
        });
        stream.on('close', function(){
            var hotelsList = hotelIdList.join(',');
            parent.getHotelAvailability(hotelsList, checkIn, checkOut, res);
        });
    },
    getHotelsById: function(hotelId, checkIn, checkOut, res){
        var hotelIdList = [];
        var parent = this;
        var stream = Hotel.find({EANHotelID: hotelId}).stream();
        stream.on('data', function(data){
            hotelIdList.push(data.EANHotelID);
        });
        stream.on('error', function(err){
            console.log('Error: ' + err);
        });
        stream.on('close', function(){
            var hotelsList = hotelIdList.join(',');
            parent.getHotelAvailability(hotelsList, checkIn, checkOut, res);
        });
    },
    getHotelsByAirport: function(airportCode, checkIn, checkOut, res){
        var hotelIdList = [];
        var parent = this;
        var stream = Hotel.find({AirportCode: airportCode}).limit(100).stream();
        stream.on('data', function(data){
            hotelIdList.push(data.EANHotelID);
        });
        stream.on('error', function(err){
            console.log('Error: ' + err);
        });
        stream.on('close', function(){
            var hotelsList = hotelIdList.join(',');
            parent.getHotelAvailability(hotelsList, checkIn, checkOut, res);
        });
    }
};