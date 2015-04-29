angular.module('app').controller('SearchCtrl', ['$scope', '$http', function($scope, $http){
    // Check in
    $scope.checkInToday = function() {
        var date = new Date();
        var day = date.getDate();
        var month = date.getMonth() + 1;
        var year = date.getFullYear();

        $scope.cidt = day+'/'+month+'/'+year;
    };
    $scope.checkInToday();

    // Disable weekend selection
    $scope.checkInDisabled = function(date, mode) {
        return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
    };

    $scope.checkInToggleMin = function() {
        $scope.checkInMinDate = $scope.checkInMinDate ? null : new Date();
    };
    $scope.checkInToggleMin();

    $scope.checkInOpen = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.checkInOpened = true;
        $scope.checkOutOpened = false;
    };

    // check out
    $scope.checkOutToday = function() {
        var date = new Date();
        var day = date.getDate() + 2;
        var month = date.getMonth() + 1;
        var year = date.getFullYear();

        $scope.codt = day+'/'+month+'/'+year;
    };
    $scope.checkOutToday();

    // Disable weekend selection
    $scope.checkOutDisabled = function(date, mode) {
        return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
    };

    $scope.checkOutToggleMin = function() {
        $scope.checkOutMinDate = $scope.checOutMinDate ? null : new Date();
    };
    $scope.checkOutToggleMin();

    $scope.checkOutOpen = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.checkOutOpened = true;
        $scope.checkInOpened = false;
    };

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };

    $scope.formats = ['dd/MM/yyyy', 'yyyy/MM/dd', 'dd/MM/yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];
}]);