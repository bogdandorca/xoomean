angular.module('app').controller('ListCtrl', ['$scope', '$http', '$routeParams', '$location', 'HotelList', 'EanImage', function($scope, $http, $routeParams, $location, HotelList, EanImage){
    $scope.hotelList = [];
    $scope.title = 'Select your favorite hotel';
    $scope.translate = function(imageUrl){
        return EanImage.translate(imageUrl, 't', 'l');
    };

    // Params
    var type = $routeParams.type;
    var destinationId = $routeParams.destination;
    var checkIn = $routeParams.checkIn;
    var checkOut = $routeParams.checkOut;
    HotelList.getHotelList(type, destinationId, checkIn, checkOut).then(function(data){
        if(!data.EanWsError){
            if(type==='hotel'){
                $scope.hotelSelect(data.HotelList.HotelSummary.hotelId);
            } else if(data.HotelList.HotelSummary.constructor === Array){
                $scope.hotelList = data.HotelList.HotelSummary;
            } else {
                $scope.hotelList.push(data.HotelList.HotelSummary);
            }
        } else {
            alert('Incorrect info');
            $location.path('/');
        }
    });
    HotelList.getDestinationDetails(destinationId).then(function(data){
        $scope.title = data.Name;
    });
    $scope.hotelSelect = function(hotelId){
        $location.path('/avail/'+hotelId+'/'+checkIn+'/'+checkOut);
    };
}]);