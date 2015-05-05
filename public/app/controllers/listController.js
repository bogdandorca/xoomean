angular.module('app').controller('ListCtrl', function($scope, $sce, $http, $routeParams, $location){
    $scope.renderHtmlElement = function(text){
        return $sce.trustAsHtml(text);
    };
    $scope.hotelList = [];

    // Params
    var type = $routeParams.type;
    var destinationId = $routeParams.destination;
    var checkIn = $routeParams.checkIn;
    var checkOut = $routeParams.checkOut;
    $http.get('/api/list/'+type+'/'+destinationId+'/'+checkIn+'/'+checkOut+'/2')
        .success(function(data){
            if(data.length !== 0){
                $scope.hotelList = data.HotelListResponse.HotelList.HotelSummary;
            }
        });
    $scope.hotelSelect = function(hotelId){
        $location.path('/avail/'+hotelId+'/'+checkIn+'/'+checkOut);
    };
});