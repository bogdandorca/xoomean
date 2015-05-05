angular.module('app').controller('BookCtrl', function($scope, $http, $routeParams){
    var hotelId = $routeParams.hotelId;
    var checkIn = $routeParams.checkIn;
    var checkOut = $routeParams.checkOut;
    var rateKey = $routeParams.rateKey;
    var roomTypeCode = $routeParams.roomTypeCode;
    var rateCode = $routeParams.rateCode;
    var chargeableRate = encodeURIComponent($routeParams.chargeableRate);

    $scope.booking = {
        firstName: 'test',
        lastName: 'booking',
        email: 'bogdandorca@gmail.com',
        phone: '0040763191543',
        cardNumber: '5401999999999999',
        cardType: 'CA',
        cardCvv: '123',
        cardMonth: '06',
        cardYear: '2017',
        cardFirstName: 'Test',
        cardLastName: 'Booking',
        address: 'travelnow',
        city: 'travelnow',
        province: '',
        country: 'RO',
        postalCode: '515400'
    };
    $scope.book = function(booking){
        $http.post('/api/book/'+hotelId+'/'+checkIn+'/'+checkOut+'/'+rateKey+'/'+roomTypeCode+'/'+rateCode+'/'+chargeableRate, {
            data: {
                firstName: $scope.booking.firstName,
                lastName: $scope.booking.lastName,
                email: $scope.booking.email,
                phone: $scope.booking.phone,
                cardNumber: $scope.booking.cardNumber,
                cardType: $scope.booking.cardType,
                cardCvv: $scope.booking.cardCvv,
                cardMonth: $scope.booking.cardMonth,
                cardYear: $scope.booking.cardYear,
                cardFirstName: $scope.booking.cardFirstName,
                cardLastName: $scope.booking.cardLastName,
                address: $scope.booking.address,
                city: $scope.booking.city,
                province: $scope.booking.province,
                country: $scope.booking.country,
                postalCode: $scope.booking.postalCode
            }
        })
            .success(function(data){
                console.log(data);
            })
            .error(function(err){
                // TODO: error catch
            });
    };
});