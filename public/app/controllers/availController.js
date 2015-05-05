angular.module('app').controller('AvailCtrl', function($scope, $routeParams, $http){
    var hotelId = $routeParams.hotelId;
    var checkIn = $routeParams.checkIn;
    var checkOut = $routeParams.checkOut;
    $http.get('/api/avail/'+hotelId+'/'+checkIn+'/'+checkOut)
        .success(function(data){
            console.log(data);
        });
});