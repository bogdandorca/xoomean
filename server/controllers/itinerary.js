var request = require('request');

module.exports = {
    formatItineraryRequest: function(itineraryId, email){
        var url = 'http://api.ean.com/ean-services/rs/hotel/v3/itin?cid=55505&minorRev=99&apiKey=cbrzfta369qwyrm9t5b8y8kf&customerUserAgent=[xxx]&customerIpAddress=[xxx]&customerSessionId=[xxx]&locale=en_US&currencyCode=USD';
        url += '&itineraryId='+itineraryId+'&email='+email;
        return url;
    },
    sendEanRequest: function(url, res){
        request.post(url, function(err, httpResponse, body){
            request(url, function(err, resp, body){
                if(!err){
                    res.send(body);
                } else {
                    res.send(err);
                }
            });
        });
    },
    getItinerary: function(itineraryId, email , res){
        var itineraryRequest = this.formatItineraryRequest(itineraryId, email);
        this.sendEanRequest(itineraryRequest, res);
    }
};