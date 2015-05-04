angular.module('app').controller('ListCtrl', function($scope, $sce, $http){
    $scope.renderHtmlElement = function(text){
        return $sce.trustAsHtml(text);
    };
    $scope.hotelList = [];
    $http.get('/api/list/city/2114/09%2F09%2F2015/09%2F11%2F2015/2')
        .success(function(data){
            if(data.length !== 0){
                $scope.hotelList = data.HotelListResponse.HotelList.HotelSummary;
            }
        });
});