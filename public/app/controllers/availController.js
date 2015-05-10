angular.module('app').controller('AvailCtrl', ['$scope', '$routeParams', '$http', '$location', 'ValueAdds', 'EanImage', '$timeout', function($scope, $routeParams, $http, $location, ValueAdds, EanImage, $timeout){
    var hotelId = $routeParams.hotelId;
    var checkIn = $routeParams.checkIn;
    var checkOut = $routeParams.checkOut;

    $scope.rooms = [];
    $scope.hotelName = 'Hotel Details';
    $scope.checkInInstructions = '';
    $scope.valueAdds = [];
    $scope.translate = function(imageUrl){
        return EanImage.translate(imageUrl, 'b', 't');
    };
    $scope.map = {
        show: false,
        refresh: function(){
            $scope.map.show = false;
            $timeout(function () {
                $scope.map.show = true;
            });
        },
        center: {
            latitude: 0,
            longitude: 0
        },
        zoom: 12,
        marker: {
            id: 1,
            coords: {
                latitude: 0,
                longitude: 0
            },
            showWindow: true
        },
        setCoordinates: function(lat, long){
            this.center.latitude = lat;
            this.center.longitude = long;
            this.marker.coords.latitude = lat;
            this.marker.coords.longitude = long;
        }
    };
    $http.get('/api/avail/'+hotelId+'/'+checkIn+'/'+checkOut)
        .success(function(data){
            console.log(data);
            data = data.HotelRoomAvailabilityResponse;
            $scope.hotelName = data.hotelName + ', ' + data.hotelCity + ', '+data.hotelCountry;
            $scope.rooms = data.HotelRoomResponse;
            $scope.checkInInstructions = data.checkInInstructions;
        });

    $scope.hotelImages = [];
    $scope.selectedHotelImage = '';
    $scope.changeHotelImage = function(imageIndex){
        $scope.selectedHotelImage = $scope.hotelImages[imageIndex].url;
    };
    $http.get('/api/hotel/information/'+hotelId)
        .success(function(data){
            console.log(data);
            data = data.HotelInformationResponse;
            $scope.hotelImages = data.HotelImages.HotelImage;
            $scope.selectedHotelImage = $scope.hotelImages[0].url;
            $scope.propertyDescription = data.HotelDetails.propertyDescription;
            $scope.map.setCoordinates(data.HotelSummary.latitude, data.HotelSummary.longitude);
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
        return ValueAdds.generateIcon(valueAdd);
    };

    $scope.selectRoom = function(room){
        var rateKey = room.RateInfos.RateInfo.RoomGroup.Room.rateKey;
        var roomTypeCode = room.roomTypeCode;
        var rateCode = room.rateCode;
        var chargeableRate = encodeURIComponent(room.RateInfos.RateInfo.ChargeableRateInfo['@total']);

        $location.path('/book/'+hotelId+'/'+checkIn+'/'+checkOut+'/'+rateKey+'/'+roomTypeCode+'/'+rateCode+'/'+chargeableRate);
    };
}]);