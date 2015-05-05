angular.module('app').controller('AvailCtrl', function($scope, $routeParams, $http, $location){
    var hotelId = $routeParams.hotelId;
    var checkIn = $routeParams.checkIn;
    var checkOut = $routeParams.checkOut;

    $scope.imageTranslator = function(url){
        var newImage = url.replace('_b.jpg', '_y.jpg');
        return newImage;
    };

    $scope.rooms = [];
    $scope.hotelName = 'Hotel Details';
    $scope.checkInInstructions = '';
    $scope.valueAdds = [];
    $http.get('/api/avail/'+hotelId+'/'+checkIn+'/'+checkOut)
        .success(function(data){
            data = data.HotelRoomAvailabilityResponse;
            $scope.hotelName = data.hotelName + ', ' + data.hotelCity + ', '+data.hotelCountry;
            $scope.rooms = data.HotelRoomResponse;
            $scope.checkInInstructions = data.checkInInstructions;
            console.log(data);
        });

    $scope.hotelImages = [];
    $http.get('/api/hotel/information/'+hotelId)
        .success(function(data){
            data = data.HotelInformationResponse;
            $scope.hotelImages = data.HotelImages.HotelImage;
        });

    // Sidebar
    $scope.oneAtATime = true;
    $scope.items = ['Item 1', 'Item 2', 'Item 3'];
    $scope.addItem = function() {
        var newItemNo = $scope.items.length + 1;
        $scope.items.push('Item ' + newItemNo);
    };
    $scope.status = {
        isFirstOpen: true,
        isFirstDisabled: false
    };

    // Value Adds
    $scope.valueAddIconGenerator = function(valueAdd){
        if(valueAdd !== undefined) {
            if (valueAdd.indexOf('Breakfast') > -1) {
                return '<i class="fa fa-cutlery"></i> ' + valueAdd;
            } else if (valueAdd.indexOf('Wireless') > -1 || valueAdd.indexOf('Internet') > -1) {
                return '<i class="fa fa-wifi"></i> ' + valueAdd;
            } else if (valueAdd.indexOf('Parking') > -1) {
                return '<i class="fa fa-car"></i> ' + valueAdd;
            } else {
                return '<i class="fa fa-money"></i> ' + valueAdd;
            }
        }
    };

    $scope.selectRoom = function(room){
        var rateKey = room.RateInfos.RateInfo.RoomGroup.Room.rateKey;
        var roomTypeCode = room.roomTypeCode;
        var rateCode = room.rateCode;
        var chargeableRate = encodeURIComponent(room.RateInfos.RateInfo.ChargeableRateInfo['@total']);

        $location.path('/book/'+hotelId+'/'+checkIn+'/'+checkOut+'/'+rateKey+'/'+roomTypeCode+'/'+rateCode+'/'+chargeableRate);
    };
});