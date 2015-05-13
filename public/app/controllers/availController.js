angular.module('app').controller('AvailCtrl', ['$scope', '$routeParams', '$http', '$location', 'ValueAdds', 'EanImage', '$timeout', function($scope, $routeParams, $http, $location, ValueAdds, EanImage, $timeout){
    var hotelId = $routeParams.hotelId;
    var checkIn = $routeParams.checkIn;
    var checkOut = $routeParams.checkOut;

    $scope.rooms = [];
    $scope.hotelName = 'Hotel Details';
    $scope.checkInInstructions = '';
    $scope.valueAdds = [];
    $scope.translate = function(imageUrl, from, to){
        return EanImage.translate(imageUrl, from, to);
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
            if(data['@size'] > 0){
                if(data.HotelRoomResponse.constructor === Array){
                    $scope.rooms = data.HotelRoomResponse;
                } else {
                    $scope.rooms.push(data.HotelRoomResponse);
                }
                $scope.hotelName = data.hotelName;
                $scope.checkInInstructions = data.checkInInstructions;
            } else {
                alert('There are no rooms available for this hotel available');
                $location.path('/');
            }
        });

    $scope.hotelImages = [];
    $scope.selectedHotelImage = '';
    $scope.activeImage = 0;
    $scope.changeHotelImage = function(imageIndex){
        $scope.selectedHotelImage = $scope.hotelImages[imageIndex].url;
        $scope.activeImage = imageIndex;
    };
    $http.get('/api/hotel/information/'+hotelId)
        .success(function(data){
            console.log(data);
            data = data.HotelInformationResponse;
            $scope.hotelImages = data.HotelImages.HotelImage;
            $scope.selectedHotelImage = $scope.hotelImages[0].url;
            $scope.propertyDescription = data.HotelDetails.propertyDescription;
            $scope.amenitiesDescription = data.HotelDetails.amenitiesDescription;
            $scope.areaInfo = data.HotelDetails.areaInformation;
            $scope.map.setCoordinates(data.HotelSummary.latitude, data.HotelSummary.longitude);
        });
    $scope.getBedTypes = function(bedTypes){
        if(bedTypes['@size'] > 1){
            return bedTypes.BedType[0].description+' / '+bedTypes.BedType[1].description;
        } else {
            return bedTypes.BedType.description;
        }
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