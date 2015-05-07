angular.module('app').controller('ConfirmationCtrl', function($scope, $http, $routeParams){
    var itineraryId = $routeParams.itineraryId,
        email = $routeParams.email;
    $scope.heading = itineraryId;
    $http.get('/api/itinerary/'+itineraryId+'/'+email)
        .success(function(data){
            data = data.HotelItineraryResponse;
            $scope.heading = data.Itinerary.itineraryId;
        })
        .error(function(err){
            console.log(err);
        });
});