angular.module('app').controller('AvailCtrl', ['$scope', '$routeParams', '$http', '$location', 'ValueAdds', 'EanImage', '$timeout', '$sanitize', function($scope, $routeParams, $http, $location, ValueAdds, EanImage, $timeout, $sanitize){
    var hotelId = $routeParams.hotelId;
    var checkIn = $routeParams.checkIn;
    var checkOut = $routeParams.checkOut;

    $scope.rooms = [];
    $scope.hotelName = '';
    $scope.hotelAddress = '';
    $scope.hotelLocation = '';
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
    $scope.propertyAmenities = [];
    $scope.starRating = 0;
    $http.get('/api/hotel/information/'+hotelId)
        .success(function(data){
            console.log(data);
            data = data.HotelInformationResponse;
            $scope.hotelImages = data.HotelImages.HotelImage;
            $scope.selectedHotelImage = $scope.hotelImages[0].url;
            $scope.hotelAddress = data.HotelSummary.address1 + ', ' + data.HotelSummary.city;
            $scope.hotelLocation = data.HotelSummary.locationDescription;
            $scope.propertyDescription = data.HotelDetails.propertyDescription.decodeHtmlEntity();
            $scope.amenitiesDescription = data.HotelDetails.amenitiesDescription.decodeHtmlEntity();
            $scope.areaInfo = data.HotelDetails.areaInformation.decodeHtmlEntity();
            // Important to be displayed
            $scope.knowBeforeYouGo = data.HotelDetails.knowBeforeYouGoDescription ? data.HotelDetails.knowBeforeYouGoDescription.decodeHtmlEntity() : '';
            $scope.checkInInstructions = data.HotelDetails.checkInInstructions.decodeHtmlEntity();
            $scope.hotelPolicy = data.HotelDetails.hotelPolicy.decodeHtmlEntity();
            $scope.propertInformation = data.HotelDetails.propertyInformation.decodeHtmlEntity();

            $scope.map.setCoordinates(data.HotelSummary.latitude, data.HotelSummary.longitude);
            $scope.propertyAmenities = data.PropertyAmenities.PropertyAmenity;
            // TODO: Set hotelRating
            $scope.starRating = data.HotelSummary.hotelRating;
            $scope.tripAdvisor = data.HotelSummary.tripAdvisorRatingUrl;
        });
    $scope.getBedTypes = function(bedTypes){
        if(bedTypes['@size'] > 1){
            return '<i class="fa-li fa fa-bed"></i>'+bedTypes.BedType[0].description+'<i class="fa-li fa fa-bed"></i>'+bedTypes.BedType[1].description;
        } else {
            return '<i class="fa-li fa fa-bed"></i>'+bedTypes.BedType.description;
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