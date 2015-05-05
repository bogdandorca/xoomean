var request = require('request');

module.exports = {
    formatDetailsRequest: function(hotelId){
        var url = 'http://api.ean.com/ean-services/rs/hotel/v3/info?cid=55505&minorRev=99&apiKey=cbrzfta369qwyrm9t5b8y8kf&customerUserAgent=[xxx]&customerIpAddress=[xxx]&customerSessionId=[xxx]&locale=en_US&currencyCode=USD';
        url += '&hotelId='+hotelId+'&options=0';
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
    getHotelDetails: function(hotelId, res){
        var detailsRequest = this.formatDetailsRequest(hotelId);
        this.sendEanRequest(detailsRequest, res);
    }
};