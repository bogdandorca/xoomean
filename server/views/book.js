var bookCtrl = require('../controllers/book');

module.exports = function(app){
    app.post('/api/book/:hotelId/:checkIn/:checkOut/:rateKey/:roomTypeCode/:rateCode/:chargeableRate', function(req, res){
        String.prototype.standardizeDate = function(){
            var dateArr = this.split('-');
            return dateArr[1]+'/'+dateArr[0]+'/'+dateArr[2];
        };
        var data = req.body.data;
        var bookingDetails = {
            hotelId: req.params.hotelId,
            checkIn: req.params.checkIn.standardizeDate(),
            checkOut: req.params.checkOut.standardizeDate(),
            rateKey: req.params.rateKey,
            roomTypeCode: req.params.roomTypeCode,
            rateCode: req.params.rateCode,
            chargeableRate: req.params.chargeableRate,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            cardNumber: data.cardNumber,
            cardType: data.cardType,
            cardCvv: data.cardCvv,
            cardMonth: data.cardMonth,
            cardYear: data.cardYear,
            cardFirstName: data.cardFirstName,
            cardLastName: data.cardLastName,
            address: data.address,
            city: data.city,
            province: data.province,
            country: data.country,
            postalCode: data.postalCode
        };
        bookCtrl.postBooking(bookingDetails, res);
    });

};