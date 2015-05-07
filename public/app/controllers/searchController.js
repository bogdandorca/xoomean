angular.module('app').controller('SearchCtrl', ['$scope', '$location', 'PopularDestinations', 'DatePicker', 'Toastr', function($scope, $location, PopularDestinations, DatePicker, Toastr){
    // Check-in
    $scope.cidt = DatePicker.newDate(1, 0, 0, 'dd/mm/yyyy');
    $scope.checkInMinDate = $scope.checkInMinDate ? null : new Date(DatePicker.newDate(1, 0, 0, 'mm/dd/yyyy'));
    $scope.checkInMaxDate = new Date(DatePicker.newDate(1, 3, 0, 'mm/dd/yyyy'));

    $scope.codt = DatePicker.newDate(3, 0, 0, 'dd/mm/yyyy');
    $scope.checkOutMinDate = $scope.checkOutMinDate ? null : new Date(DatePicker.newDate(3, 0, 0, 'mm/dd/yyyy'));
    $scope.checkOutMaxDate = new Date(DatePicker.newDate(2, 3, 0, 'mm/dd/yyyy'));


    $scope.checkInOpened = false;
    $scope.checkOutOpened = false;

    $scope.datepickerOpen = function($event, panel){
        $event.preventDefault();
        $event.stopPropagation();
        $scope.checkInOpened = (panel === 'checkIn');
        $scope.checkOutOpened = (panel === 'checkOut');
    };
    $scope.dateOptions = DatePicker.dateOptions;
    $scope.format = DatePicker.format;

    // Recommended destinations
    $scope.popularDestinations = [];
    $scope.popularDestinationsLoader = true;
    // Default dates to search for
    $scope.defaultCheckIn = DatePicker.newDate(2, 0, 0, 'dd-mm-yyyy');
    $scope.defaultCheckOut = DatePicker.newDate(5, 0, 0, 'dd-mm-yyyy');
    PopularDestinations.getPopularDestinations().then(function(data){
        $scope.popularDestinations = data;
        $scope.popularDestinationsLoader = false;
    });


    // Form
    $scope.searchHotels = function(destination, checkIn, checkOut){
        // TODO: Set-up validation
        if(destination && destination.Type && destination.DestinationId){
            if(checkIn && checkOut ){
                toastr.clear();
                $location.path('/list/'+destination.Type+'/'+destination.DestinationId+'/'+DatePicker.replaceDateSeparator(checkIn)+'/'+DatePicker.replaceDateSeparator(checkOut));
            } else {
                Toastr.errorToast('The dates selected are incorrect.');
            }
        } else {
            Toastr.errorToast('The destination entered is incorrect.');
        }
    };
}]);