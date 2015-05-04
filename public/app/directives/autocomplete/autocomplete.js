angular.module('app').directive('ngAutocomplete', function($document, $http, PopularDestinations){
    var linker = function(scope, element, attr){
        $document.click(function(){
            scope.$apply(scope.hideAutocomplete = true);
        });
        element.click(function(e){
            e.stopPropagation();
        });
    };
    var controller = function($scope, $element){
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

        // Get autocomplete list
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
                            $scope.hideAutocomplete = false;
                        }
                    });
            } else {
                resetAutocomplete();
                $scope.hideAutocomplete = true;
            }
        };

        // Category hide
        $scope.citiesArrayIsEmpty = function(){
            return ($scope.autocompleteList.cities.length === 0);
        };
        $scope.hotelsArrayIsEmpty = function(){
            return ($scope.autocompleteList.hotels.length === 0);
        };
        $scope.airportsArrayIsEmpty = function(){
            return ($scope.autocompleteList.airports.length === 0);
        };

        // Autocomplete hide
        $scope.hideAutocomplete = true;
        var autocompleteListIsEmpty = function(){
            return ($scope.autocompleteList.cities.length === 0 && $scope.autocompleteList.hotels.length === 0 && $scope.autocompleteList.airports.length === 0);
        };
        $scope.autocompleteIsHidden = function(){
            return (autocompleteListIsEmpty() || $scope.hideAutocomplete);
        };

        // Autocomplete select
        $scope.selectDestination = function(item, type){
            $scope.destination = item.Name;
            $scope.selectedDestination = item;
            PopularDestinations.indentSelection(item.DestinationId);
            resetAutocomplete();
        }
    };
    return {
        restrict: 'A',
        link: linker,
        controller: controller,
        templateUrl: './partials/index/autocomplete'
    }
});