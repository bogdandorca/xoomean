var request = require('request');

module.exports = {
    formatBookingRequest: function(bookingDetails){
        var url = 'https://book.api.ean.com/ean-services/rs/hotel/v3/res?cid=55505&minorRev=99&apiKey=cbrzfta369qwyrm9t5b8y8kf&customerUserAgent=[xxx]&customerIpAddress=[xxx]&customerSessionId=[xxx]&locale=en_US&currencyCode=USD';
        url += '&hotelId='+bookingDetails.hotelId+'&arrivalDate='+bookingDetails.checkIn+'&departureDate='+bookingDetails.checkOut+'&supplierType=E&rateKey='+bookingDetails.rateKey+'&roomTypeCode='+bookingDetails.roomTypeCode+'&rateCode='+bookingDetails.rateCode+'&chargeableRate='+bookingDetails.chargeableRate;
        url += '&room1=2&room1FirstName='+bookingDetails.firstName+'&room1LastName='+bookingDetails.lastName+'&room1BedTypeId=23&room1SmokingPreference=NS';
        url += '&email='+bookingDetails.email+'&firstName='+bookingDetails.cardFirstName+'&lastName='+bookingDetails.cardLastName+'&homePhone='+bookingDetails.phone+'&creditCardType='+bookingDetails.cardType+'&creditCardNumber='+bookingDetails.cardNumber+'&creditCardIdentifier='+bookingDetails.cardCvv+'&creditCardExpirationMonth='+bookingDetails.cardMonth+'&creditCardExpirationYear='+bookingDetails.cardYear;
        url += '&address1='+bookingDetails.address+'&city='+bookingDetails.city+'&countryCode='+bookingDetails.country+'&postalCode'+bookingDetails.postalCode;
        return url;
    },
    sendEanPostRequest: function(url, res){
        request.post(url, function(err, httpResponse, body){
            if(!err){
                console.log('Success!');
                res.send(body);
            } else {
                console.log('Error!');
                res.send(err);
            }
        });
    },
    postBooking: function(bookingDetails, res){
        var bookingRequest = this.formatBookingRequest(bookingDetails);
        this.sendEanPostRequest(bookingRequest, res);
    }
};