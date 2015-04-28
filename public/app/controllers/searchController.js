angular.module('app').controller('SearchCtrl', ['$scope', '$http', function($scope, $http){
    $scope.autocompleteList = {
        cities: [],
        hotels: [],
        airports: []
    };
    var resetAutocomplete = function(){
        $scope.autocompleteList = {
            cities: [],
            hotels: [],
            airports: []
        }
    };
    $scope.autocomplete = function(destination){
        if(destination.length > 2){
            $http.get('/api/autocomplete/'+destination)
                .success(function(data){
                    resetAutocomplete();
                    for(var i=0;i<data.length;i++){
                        if(data[i].Type === 'city'){
                            $scope.autocompleteList.cities.push(data[i]);
                        } else if(data[i].Type === 'hotel'){
                            $scope.autocompleteList.hotels.push(data[i]);
                        } else if(data[i].Type === 'airport'){
                            $scope.autocompleteList.airports.push(data[i]);
                        }
                    }
                });
        } else {
            resetAutocomplete();
        }
    };
    $scope.autocompelteListIsEmpty = function(){
        return ($scope.autocompleteList.cities.length === 0 && $scope.autocompleteList.hotels.length === 0 && $scope.autocompleteList.airports.length === 0);
    };
    $scope.citiesArrayIsEmpty = function(){
        return ($scope.autocompleteList.cities.length === 0);
    };
    $scope.hotelsArrayIsEmpty = function(){
        return ($scope.autocompleteList.hotels.length === 0);
    };
    $scope.airportsArrayIsEmpty = function(){
        return ($scope.autocompleteList.airports.length === 0);
    };
    $scope.selectDestination = function(item, type){
        $scope.destination = item.Name;
        resetAutocomplete();
    }
}]);