angular.module('app').controller('SearchCtrl', ['$scope', '$location', 'PopularDestinations', function($scope, $location, PopularDestinations){
    // Set-up functions
    String.prototype.dmFormat = function(){
        if(this.length === 1){
            return '0'+this;
        } else {
            return this;
        }
    };
    var formatDate = function(day, month, year, format){
        if(format === 'dd/mm/yyyy'){
            return day+'/'+month+'/'+year;
        } else if(format === 'mm/dd/yyyy'){
            return month+'/'+day+'/'+year;
        } else if(format === 'yyyy/mm/dd') {
            return year + '/' + month + '/' + day;
        } else if(format === 'dd-mm-yyyy') {
            return day+'-'+month+'-'+year;
        } else {
            return '';
        }
    };
    var setNewDate = function(dayDelay, monthDelay, yearDelay, format){
        var date = new Date();
        date.setDate(date.getDate() + dayDelay);

        var day = date.getDate().toString().dmFormat();
        var month = (date.getMonth() + 1 + monthDelay).toString().dmFormat();
        var year = date.getFullYear() + yearDelay;

        return formatDate(day, month, year, format);
    };


    // Check in
    $scope.checkInToday = function() {
        $scope.cidt = setNewDate(1, 0, 0, 'dd/mm/yyyy');
    };
    $scope.checkInToday();

    $scope.checkInToggleMin = function() {
        $scope.checkInMinDate = $scope.checkInMinDate ? null : new Date(setNewDate(1, 0, 0, 'mm/dd/yyyy'));
    };
    $scope.checkInToggleMin();
    $scope.checkInMaxDate = new Date(setNewDate(1, 3, 0, 'mm/dd/yyyy'));

    $scope.checkInOpen = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.checkInOpened = true;
        $scope.checkOutOpened = false;
    };

    // check out
    $scope.checkOutToday = function() {
        $scope.codt = setNewDate(3, 0, 0, 'dd/mm/yyyy');
    };
    $scope.checkOutToday();
    $scope.checkOutToggleMin = function() {
        $scope.checkOutMinDate = $scope.checkOutMinDate ? null : new Date(setNewDate(3, 0, 0, 'mm/dd/yyyy'));
    };
    $scope.checkOutToggleMin();
    $scope.checkOutMaxDate = new Date(setNewDate(2, 3, 0, 'mm/dd/yyyy'));

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

    // Recommended destinations
    $scope.popularDestinations = [];
    $scope.popularDestinationsLoader = true;
    PopularDestinations.getPopularDestinations().then(function(data){
        $scope.popularDestinations = data;
        $scope.popularDestinationsLoader = false;
    });
    $scope.defaultCheckIn = setNewDate(2, 0, 0, 'dd-mm-yyyy');
    $scope.defaultCheckOut = setNewDate(5, 0, 0, 'dd-mm-yyyy');

    // Form
    var replaceDateSeparator = function(oldDate){
        return oldDate.replace('/', '-').replace('/', '-');
    };
    $scope.searchHotels = function(destination, checkIn, checkOut){
        // TODO: Set-up validation
        if(destination && destination.Type && destination.DestinationId){
            if(checkIn && checkOut ){
                toastr.clear();
                $location.path('/list/'+destination.Type+'/'+destination.DestinationId+'/'+replaceDateSeparator(checkIn)+'/'+replaceDateSeparator(checkOut));
            } else {
                toastr.options.closeButton = true;
                toastr.options.preventDuplicates = true;
                toastr.error('The dates selected are incorrect.');
            }
        } else {
            toastr.options.closeButton = true;
            toastr.options.preventDuplicates = true;
            toastr.error('The destination entered is incorrect.');
        }
    };
}]);