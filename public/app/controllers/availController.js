angular.module('app').controller('AvailCtrl', function($scope, $routeParams, $http){
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

    // Slider
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
});