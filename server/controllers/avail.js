var request = require('request');

module.exports = {
    formatAvailRequest: function(hotelId, checkIn, checkOut){
        var url = 'http://api.ean.com/ean-services/rs/hotel/v3/avail?cid=55505&minorRev=99&apiKey=cbrzfta369qwyrm9t5b8y8kf&customerUserAgent=[xxx]&customerIpAddress=[xxx]&customerSessionId=[xxx]&locale=en_US&currencyCode=USD';
        url += '&hotelId='+hotelId+'&arrivalDate='+checkIn+'&departureDate='+checkOut+'&includeDetails=true&includeRoomImages=true&room1=2';

        return url;
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
    getRoomAvailability: function(hotelId, checkIn, checkOut, res){
        var availRequest = this.formatAvailRequest(hotelId, checkIn, checkOut);
        this.sendEanRequest(availRequest, res);
    }
};