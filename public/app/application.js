String.prototype.dmFormat = function(){
    if(this.length === 1){
        return '0'+this;
    } else {
        return this;
    }
};
angular.module('app', ['ngRoute', 'ui.bootstrap', 'ngAnimate', 'uiGmapgoogle-maps', 'ngSanitize']).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
    $locationProvider.html5Mode(true);
    $routeProvider
        .when('/', {
            templateUrl: '/partials/index/search',
            controller: 'SearchCtrl'
        })
        .when('/list/:type/:destination/:checkIn/:checkOut', {
            templateUrl: '/partials/list/list',
            controller: 'ListCtrl'
        })
        .when('/avail/:hotelId/:checkIn/:checkOut', {
            templateUrl: '/partials/avail/avail',
            controller: 'AvailCtrl'
        })
        .when('/book/:hotelId/:checkIn/:checkOut/:rateKey/:roomTypeCode/:rateCode/:chargeableRate', {
            templateUrl: 'partials/book/book',
            controller: 'BookCtrl'
        })
        .when('/confirmation/:itineraryId/:email', {
            templateUrl: 'partials/confirmation/confirmation',
            controller: 'ConfirmationCtrl'
        })
        .otherwise({
            templateUrl: 'partials/404'
        });
}]);

angular.module('app').controller('AvailCtrl', ['$scope', '$routeParams', '$http', '$location', 'ValueAdds', 'EanImage', '$timeout', function($scope, $routeParams, $http, $location, ValueAdds, EanImage, $timeout){
    var hotelId = $routeParams.hotelId;
    var checkIn = $routeParams.checkIn;
    var checkOut = $routeParams.checkOut;

    $scope.rooms = [];
    $scope.hotelName = 'Hotel Details';
    $scope.checkInInstructions = '';
    $scope.valueAdds = [];
    $scope.translate = function(imageUrl, from, to){
        return EanImage.translate(imageUrl, from, to);
    };
    $scope.map = {
        show: false,
        refresh: function(){
            $scope.map.show = false;
            $timeout(function () {
                $scope.map.show = true;
            });
        },
        center: {
            latitude: 0,
            longitude: 0
        },
        zoom: 12,
        marker: {
            id: 1,
            coords: {
                latitude: 0,
                longitude: 0
            },
            showWindow: true
        },
        setCoordinates: function(lat, long){
            this.center.latitude = lat;
            this.center.longitude = long;
            this.marker.coords.latitude = lat;
            this.marker.coords.longitude = long;
        }
    };
    $http.get('/api/avail/'+hotelId+'/'+checkIn+'/'+checkOut)
        .success(function(data){
            console.log(data);
            data = data.HotelRoomAvailabilityResponse;
            if(data['@size'] > 0){
                if(data.HotelRoomResponse.constructor === Array){
                    $scope.rooms = data.HotelRoomResponse;
                } else {
                    $scope.rooms.push(data.HotelRoomResponse);
                }
                $scope.hotelName = data.hotelName;
                $scope.checkInInstructions = data.checkInInstructions;
            } else {
                alert('There are no rooms available for this hotel available');
                $location.path('/');
            }
        });

    $scope.hotelImages = [];
    $scope.selectedHotelImage = '';
    $scope.activeImage = 0;
    $scope.changeHotelImage = function(imageIndex){
        $scope.selectedHotelImage = $scope.hotelImages[imageIndex].url;
        $scope.activeImage = imageIndex;
    };
    $http.get('/api/hotel/information/'+hotelId)
        .success(function(data){
            console.log(data);
            data = data.HotelInformationResponse;
            $scope.hotelImages = data.HotelImages.HotelImage;
            $scope.selectedHotelImage = $scope.hotelImages[0].url;
            $scope.propertyDescription = data.HotelDetails.propertyDescription;
            $scope.amenitiesDescription = data.HotelDetails.amenitiesDescription;
            $scope.areaInfo = data.HotelDetails.areaInformation;
            $scope.map.setCoordinates(data.HotelSummary.latitude, data.HotelSummary.longitude);
        });
    $scope.getBedTypes = function(bedTypes){
        if(bedTypes['@size'] > 1){
            return '<i class="fa-li fa fa-bed"></i>'+bedTypes.BedType[0].description+'<i class="fa-li fa fa-bed"></i>'+bedTypes.BedType[1].description;
        } else {
            return '<i class="fa-li fa fa-bed"></i>'+bedTypes.BedType.description;
        }
    };
    // Value Adds
    $scope.valueAddIconGenerator = function(valueAdd){
        return ValueAdds.generateIcon(valueAdd);
    };

    $scope.selectRoom = function(room){
        var rateKey = room.RateInfos.RateInfo.RoomGroup.Room.rateKey;
        var roomTypeCode = room.roomTypeCode;
        var rateCode = room.rateCode;
        var chargeableRate = encodeURIComponent(room.RateInfos.RateInfo.ChargeableRateInfo['@total']);

        $location.path('/book/'+hotelId+'/'+checkIn+'/'+checkOut+'/'+rateKey+'/'+roomTypeCode+'/'+rateCode+'/'+chargeableRate);
    };
}]);
angular.module('app').controller('BookCtrl', ['$scope', '$http', '$routeParams', '$location', function($scope, $http, $routeParams, $location){
    var hotelId = $routeParams.hotelId;
    var checkIn = $routeParams.checkIn;
    var checkOut = $routeParams.checkOut;
    var rateKey = $routeParams.rateKey;
    var roomTypeCode = $routeParams.roomTypeCode;
    var rateCode = $routeParams.rateCode;
    var chargeableRate = encodeURIComponent($routeParams.chargeableRate);

    $scope.booking = {
        firstName: 'test',
        lastName: 'booking',
        email: 'bogdandorca@gmail.com',
        phone: '0040763191543',
        cardNumber: '5401999999999999',
        cardType: 'CA',
        cardCvv: '123',
        cardMonth: '06',
        cardYear: '2017',
        cardFirstName: 'Test',
        cardLastName: 'Booking',
        address: 'travelnow',
        city: 'travelnow',
        province: '',
        country: 'RO',
        postalCode: '515400'
    };
    $scope.book = function(booking){
        $http.post('/api/book/'+hotelId+'/'+checkIn+'/'+checkOut+'/'+rateKey+'/'+roomTypeCode+'/'+rateCode+'/'+chargeableRate, {
            data: {
                firstName: $scope.booking.firstName,
                lastName: $scope.booking.lastName,
                email: $scope.booking.email,
                phone: $scope.booking.phone,
                cardNumber: $scope.booking.cardNumber,
                cardType: $scope.booking.cardType,
                cardCvv: $scope.booking.cardCvv,
                cardMonth: $scope.booking.cardMonth,
                cardYear: $scope.booking.cardYear,
                cardFirstName: $scope.booking.cardFirstName,
                cardLastName: $scope.booking.cardLastName,
                address: $scope.booking.address,
                city: $scope.booking.city,
                province: $scope.booking.province,
                country: $scope.booking.country,
                postalCode: $scope.booking.postalCode
            }
        })
            .success(function(data){
                data = data.HotelRoomReservationResponse;
                var itineraryId = data.itineraryId;
                $location.path('/confirmation/'+itineraryId+'/'+$scope.booking.email);
            })
            .error(function(err){
                // TODO: error catch
            });
    };
}]);
angular.module('app').controller('ConfirmationCtrl', ['$scope', '$http', '$routeParams', function($scope, $http, $routeParams){
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
}]);
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
angular.module('app').filter('unsafe', ['$sce', function($sce) { return $sce.trustAsHtml; }]);
angular.module('app').directive('ngStarRating', [function(){
    var linker = function(scope, element, attr){
        scope.numberOfStars = attr.stars;
    };
    var getTemplate = function(){
        var templateStructure = '<div class="stars">';
        templateStructure += '<span ng-show="(numberOfStars >= 1) || numberOfStars == 0.5">' +
                '<i class="fa" ng-class="numberOfStars == 0.5 ? \'fa-star-half\' : \'fa-star\'"></i>' +
            '</span>';
        templateStructure += '<span ng-show="(numberOfStars >= 2) || numberOfStars == 1.5">' +
            '<i class="fa" ng-class="numberOfStars == 1.5 ? \'fa-star-half\' : \'fa-star\'"></i>' +
            '</span>';
        templateStructure += '<span ng-show="(numberOfStars >= 3) || numberOfStars == 2.5">' +
            '<i class="fa" ng-class="numberOfStars == 2.5 ? \'fa-star-half\' : \'fa-star\'"></i>' +
            '</span>';
        templateStructure += '<span ng-show="(numberOfStars >= 4) || numberOfStars == 3.5">' +
            '<i class="fa" ng-class="numberOfStars == 3.5 ? \'fa-star-half\' : \'fa-star\'"></i>' +
            '</span>';
        templateStructure += '<span ng-show="(numberOfStars >= 5) || numberOfStars == 4.5">' +
            '<i class="fa" ng-class="numberOfStars == 4.5 ? \'fa-star-half\' : \'fa-star\'"></i>' +
            '</span>';
        templateStructure += '</div>';

        return templateStructure;
    };
    return {
        restrict: 'E',
        template: getTemplate(),
        link: linker
    };
}]);
angular.module('app').factory('DatePicker', [function(){
    return {
        formatDate: function(day, month, year, format){
            if(format === 'dd/mm/yyyy'){
                return (day.toString().dmFormat())+'/'+(month.toString().dmFormat())+'/'+year;
            } else if(format === 'mm/dd/yyyy'){
                return (month.toString().dmFormat())+'/'+(day.toString().dmFormat())+'/'+year;
            } else if(format === 'yyyy/mm/dd') {
                return year + '/' + (month.toString().dmFormat()) + '/' + (day.toString().dmFormat());
            } else if(format === 'dd-mm-yyyy') {
                return (day.toString().dmFormat())+'-'+(month.toString().dmFormat())+'-'+year;
            } else if(format === 'mm-dd-yyyy') {
                return ((month.toString().dmFormat())+'-'+day.toString().dmFormat())+'-'+year;
            } else {
                return '';
            }
        },
        newDate: function(dayDelay, monthDelay, yearDelay, format){
            var date = new Date();
            date.setDate(date.getDate() + dayDelay);

            var day = date.getDate().toString().dmFormat();
            var month = (date.getMonth() + 1 + monthDelay).toString().dmFormat();
            var year = date.getFullYear() + yearDelay;

            return this.formatDate(day, month, year, format);
        },
        replaceDateSeparator: function(oldDate){
            if(oldDate.constructor !== String){
                return this.formatDate(oldDate.getDate(), (oldDate.getMonth()+1), oldDate.getFullYear(), 'dd-mm-yyyy');
            } else {
                return oldDate.replace('/', '-').replace('/', '-');
            }
        },
        dateOptions: {
            formatYear: 'yy',
            startingDay: 1
        },
        formats: ['dd/MM/yyyy', 'yyyy/MM/dd', 'dd/MM/yyyy', 'shortDate'],
        format: 'dd/MM/yyyy'
    };
}]);
angular.module('app').factory('HotelList', ['$http', '$q', function($http, $q){
    return {
        getHotelList: function(type, destinationId, checkIn, checkOut){
            var defer = $q.defer();
            $http.get('/api/list/'+type+'/'+destinationId+'/'+checkIn+'/'+checkOut+'/2')
                .success(function(data){
                    if(data.length !== 0){
                        defer.resolve(data.HotelListResponse);
                    }
                });
            return defer.promise;
        },
        getDestinationDetails: function(destinationId){
            var defer = $q.defer();
            $http.get('/api/destination/details/'+destinationId)
                .success(function(data){
                    defer.resolve(data);
                })
                .error(function(){
                    defer.resolve('Select your favorite hotel');
                });
            return defer.promise;
        }
    };
}]);
angular.module('app').factory('EanImage', [function(){
    return {
        translate: function(image, from, to){
            return image.replace('_'+from+'.jpg', '_'+to+'.jpg');
        }
    };

}]);
angular.module('app').factory('PopularDestinations', ['$http', '$q', function($http, $q){
    return {
        getPopularDestinations: function(){
            var deferred = $q.defer();
            $http.get('/api/popular/7')
                .success(function(data){
                    deferred.resolve(data);
                });
            return deferred.promise;
        },
        indentSelection: function(destinationId){
            $http.post('/api/popular/'+destinationId, {});
        }
    };
}]);
angular.module('app').factory('Toastr', [function(){
    return {
        successToast: function(message){
            toastr.options.closeButton = true;
            toastr.options.preventDuplicates = true;
            toastr.success(message);
        },
        errorToast: function(message){
            toastr.options.closeButton = true;
            toastr.options.preventDuplicates = true;
            toastr.error(message);
        }
    };
}]);
angular.module('app').factory('ValueAdds', [function(){
    return {
        generateIcon: function(valueAdd){
            if(valueAdd !== undefined) {
                if (valueAdd.indexOf('Breakfast') > -1) {
                    return '<i class="fa fa-cutlery fa-li"></i> ' + valueAdd;
                } else if (valueAdd.indexOf('Wireless') > -1 || valueAdd.indexOf('Internet') > -1) {
                    return '<i class="fa fa-wifi fa-li"></i> ' + valueAdd;
                } else if (valueAdd.indexOf('Parking') > -1) {
                    return '<i class="fa fa-car fa-li"></i> ' + valueAdd;
                } else {
                    return '<i class="fa fa-money fa-li"></i> ' + valueAdd;
                }
            }
        }
    };
}]);
angular.module('app').directive('ngAutocomplete', ['$document', '$http', 'PopularDestinations', function($document, $http, PopularDestinations){
    var linker = function(scope, element){
        $document.click(function(){
            scope.$apply(scope.hideAutocomplete = true);
        });
        element.click(function(event){
            event.stopPropagation();
        });
    };
    var controller = function($scope){
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
            };
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
        };
    };
    return {
        restrict: 'A',
        link: linker,
        controller: controller,
        templateUrl: './partials/index/autocomplete'
    };
}]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFpcnBsYW5lcy5qcyIsImFwcC5qcyIsImNvbnRyb2xsZXJzL2F2YWlsQ29udHJvbGxlci5qcyIsImNvbnRyb2xsZXJzL2Jvb2tDb250cm9sbGVyLmpzIiwiY29udHJvbGxlcnMvY29uZmlybWF0aW9uQ29udHJvbGxlci5qcyIsImNvbnRyb2xsZXJzL2xpc3RDb250cm9sbGVyLmpzIiwiY29udHJvbGxlcnMvc2VhcmNoQ29udHJvbGxlci5qcyIsImZpbHRlcnMvaGVscGVycy5qcyIsImRpcmVjdGl2ZXMvc3RhclJhdGluZy5qcyIsInNlcnZpY2VzL2RhdGVwaWNrZXJTZXJ2aWNlLmpzIiwic2VydmljZXMvaG90ZWxMaXN0U2VydmljZS5qcyIsInNlcnZpY2VzL2ltYWdlU2VydmljZS5qcyIsInNlcnZpY2VzL3BvcHVsYXJEZXN0aW5hdGlvbnMuanMiLCJzZXJ2aWNlcy90b2FzdHJTZXJ2aWNlLmpzIiwic2VydmljZXMvdmFsdWVBZGRzU2VydmljZS5qcyIsImRpcmVjdGl2ZXMvYXV0b2NvbXBsZXRlL2F1dG9jb21wbGV0ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqREE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHBsaWNhdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIlN0cmluZy5wcm90b3R5cGUuZG1Gb3JtYXQgPSBmdW5jdGlvbigpe1xyXG4gICAgaWYodGhpcy5sZW5ndGggPT09IDEpe1xyXG4gICAgICAgIHJldHVybiAnMCcrdGhpcztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbn07IiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcsIFsnbmdSb3V0ZScsICd1aS5ib290c3RyYXAnLCAnbmdBbmltYXRlJywgJ3VpR21hcGdvb2dsZS1tYXBzJywgJ25nU2FuaXRpemUnXSkuY29uZmlnKFsnJHJvdXRlUHJvdmlkZXInLCAnJGxvY2F0aW9uUHJvdmlkZXInLCBmdW5jdGlvbigkcm91dGVQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIpe1xyXG4gICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpO1xyXG4gICAgJHJvdXRlUHJvdmlkZXJcclxuICAgICAgICAud2hlbignLycsIHtcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvcGFydGlhbHMvaW5kZXgvc2VhcmNoJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ1NlYXJjaEN0cmwnXHJcbiAgICAgICAgfSlcclxuICAgICAgICAud2hlbignL2xpc3QvOnR5cGUvOmRlc3RpbmF0aW9uLzpjaGVja0luLzpjaGVja091dCcsIHtcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvcGFydGlhbHMvbGlzdC9saXN0JyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0xpc3RDdHJsJ1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLndoZW4oJy9hdmFpbC86aG90ZWxJZC86Y2hlY2tJbi86Y2hlY2tPdXQnLCB7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL3BhcnRpYWxzL2F2YWlsL2F2YWlsJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0F2YWlsQ3RybCdcclxuICAgICAgICB9KVxyXG4gICAgICAgIC53aGVuKCcvYm9vay86aG90ZWxJZC86Y2hlY2tJbi86Y2hlY2tPdXQvOnJhdGVLZXkvOnJvb21UeXBlQ29kZS86cmF0ZUNvZGUvOmNoYXJnZWFibGVSYXRlJywge1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3BhcnRpYWxzL2Jvb2svYm9vaycsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdCb29rQ3RybCdcclxuICAgICAgICB9KVxyXG4gICAgICAgIC53aGVuKCcvY29uZmlybWF0aW9uLzppdGluZXJhcnlJZC86ZW1haWwnLCB7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAncGFydGlhbHMvY29uZmlybWF0aW9uL2NvbmZpcm1hdGlvbicsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdDb25maXJtYXRpb25DdHJsJ1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLm90aGVyd2lzZSh7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAncGFydGlhbHMvNDA0J1xyXG4gICAgICAgIH0pO1xyXG59XSk7XHJcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb250cm9sbGVyKCdBdmFpbEN0cmwnLCBbJyRzY29wZScsICckcm91dGVQYXJhbXMnLCAnJGh0dHAnLCAnJGxvY2F0aW9uJywgJ1ZhbHVlQWRkcycsICdFYW5JbWFnZScsICckdGltZW91dCcsIGZ1bmN0aW9uKCRzY29wZSwgJHJvdXRlUGFyYW1zLCAkaHR0cCwgJGxvY2F0aW9uLCBWYWx1ZUFkZHMsIEVhbkltYWdlLCAkdGltZW91dCl7XHJcbiAgICB2YXIgaG90ZWxJZCA9ICRyb3V0ZVBhcmFtcy5ob3RlbElkO1xyXG4gICAgdmFyIGNoZWNrSW4gPSAkcm91dGVQYXJhbXMuY2hlY2tJbjtcclxuICAgIHZhciBjaGVja091dCA9ICRyb3V0ZVBhcmFtcy5jaGVja091dDtcclxuXHJcbiAgICAkc2NvcGUucm9vbXMgPSBbXTtcclxuICAgICRzY29wZS5ob3RlbE5hbWUgPSAnSG90ZWwgRGV0YWlscyc7XHJcbiAgICAkc2NvcGUuY2hlY2tJbkluc3RydWN0aW9ucyA9ICcnO1xyXG4gICAgJHNjb3BlLnZhbHVlQWRkcyA9IFtdO1xyXG4gICAgJHNjb3BlLnRyYW5zbGF0ZSA9IGZ1bmN0aW9uKGltYWdlVXJsLCBmcm9tLCB0byl7XHJcbiAgICAgICAgcmV0dXJuIEVhbkltYWdlLnRyYW5zbGF0ZShpbWFnZVVybCwgZnJvbSwgdG8pO1xyXG4gICAgfTtcclxuICAgICRzY29wZS5tYXAgPSB7XHJcbiAgICAgICAgc2hvdzogZmFsc2UsXHJcbiAgICAgICAgcmVmcmVzaDogZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgJHNjb3BlLm1hcC5zaG93ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS5tYXAuc2hvdyA9IHRydWU7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY2VudGVyOiB7XHJcbiAgICAgICAgICAgIGxhdGl0dWRlOiAwLFxyXG4gICAgICAgICAgICBsb25naXR1ZGU6IDBcclxuICAgICAgICB9LFxyXG4gICAgICAgIHpvb206IDEyLFxyXG4gICAgICAgIG1hcmtlcjoge1xyXG4gICAgICAgICAgICBpZDogMSxcclxuICAgICAgICAgICAgY29vcmRzOiB7XHJcbiAgICAgICAgICAgICAgICBsYXRpdHVkZTogMCxcclxuICAgICAgICAgICAgICAgIGxvbmdpdHVkZTogMFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzaG93V2luZG93OiB0cnVlXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXRDb29yZGluYXRlczogZnVuY3Rpb24obGF0LCBsb25nKXtcclxuICAgICAgICAgICAgdGhpcy5jZW50ZXIubGF0aXR1ZGUgPSBsYXQ7XHJcbiAgICAgICAgICAgIHRoaXMuY2VudGVyLmxvbmdpdHVkZSA9IGxvbmc7XHJcbiAgICAgICAgICAgIHRoaXMubWFya2VyLmNvb3Jkcy5sYXRpdHVkZSA9IGxhdDtcclxuICAgICAgICAgICAgdGhpcy5tYXJrZXIuY29vcmRzLmxvbmdpdHVkZSA9IGxvbmc7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgICRodHRwLmdldCgnL2FwaS9hdmFpbC8nK2hvdGVsSWQrJy8nK2NoZWNrSW4rJy8nK2NoZWNrT3V0KVxyXG4gICAgICAgIC5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcclxuICAgICAgICAgICAgZGF0YSA9IGRhdGEuSG90ZWxSb29tQXZhaWxhYmlsaXR5UmVzcG9uc2U7XHJcbiAgICAgICAgICAgIGlmKGRhdGFbJ0BzaXplJ10gPiAwKXtcclxuICAgICAgICAgICAgICAgIGlmKGRhdGEuSG90ZWxSb29tUmVzcG9uc2UuY29uc3RydWN0b3IgPT09IEFycmF5KXtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUucm9vbXMgPSBkYXRhLkhvdGVsUm9vbVJlc3BvbnNlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUucm9vbXMucHVzaChkYXRhLkhvdGVsUm9vbVJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICRzY29wZS5ob3RlbE5hbWUgPSBkYXRhLmhvdGVsTmFtZTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5jaGVja0luSW5zdHJ1Y3Rpb25zID0gZGF0YS5jaGVja0luSW5zdHJ1Y3Rpb25zO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYWxlcnQoJ1RoZXJlIGFyZSBubyByb29tcyBhdmFpbGFibGUgZm9yIHRoaXMgaG90ZWwgYXZhaWxhYmxlJyk7XHJcbiAgICAgICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnLycpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgJHNjb3BlLmhvdGVsSW1hZ2VzID0gW107XHJcbiAgICAkc2NvcGUuc2VsZWN0ZWRIb3RlbEltYWdlID0gJyc7XHJcbiAgICAkc2NvcGUuYWN0aXZlSW1hZ2UgPSAwO1xyXG4gICAgJHNjb3BlLmNoYW5nZUhvdGVsSW1hZ2UgPSBmdW5jdGlvbihpbWFnZUluZGV4KXtcclxuICAgICAgICAkc2NvcGUuc2VsZWN0ZWRIb3RlbEltYWdlID0gJHNjb3BlLmhvdGVsSW1hZ2VzW2ltYWdlSW5kZXhdLnVybDtcclxuICAgICAgICAkc2NvcGUuYWN0aXZlSW1hZ2UgPSBpbWFnZUluZGV4O1xyXG4gICAgfTtcclxuICAgICRodHRwLmdldCgnL2FwaS9ob3RlbC9pbmZvcm1hdGlvbi8nK2hvdGVsSWQpXHJcbiAgICAgICAgLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSl7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xyXG4gICAgICAgICAgICBkYXRhID0gZGF0YS5Ib3RlbEluZm9ybWF0aW9uUmVzcG9uc2U7XHJcbiAgICAgICAgICAgICRzY29wZS5ob3RlbEltYWdlcyA9IGRhdGEuSG90ZWxJbWFnZXMuSG90ZWxJbWFnZTtcclxuICAgICAgICAgICAgJHNjb3BlLnNlbGVjdGVkSG90ZWxJbWFnZSA9ICRzY29wZS5ob3RlbEltYWdlc1swXS51cmw7XHJcbiAgICAgICAgICAgICRzY29wZS5wcm9wZXJ0eURlc2NyaXB0aW9uID0gZGF0YS5Ib3RlbERldGFpbHMucHJvcGVydHlEZXNjcmlwdGlvbjtcclxuICAgICAgICAgICAgJHNjb3BlLmFtZW5pdGllc0Rlc2NyaXB0aW9uID0gZGF0YS5Ib3RlbERldGFpbHMuYW1lbml0aWVzRGVzY3JpcHRpb247XHJcbiAgICAgICAgICAgICRzY29wZS5hcmVhSW5mbyA9IGRhdGEuSG90ZWxEZXRhaWxzLmFyZWFJbmZvcm1hdGlvbjtcclxuICAgICAgICAgICAgJHNjb3BlLm1hcC5zZXRDb29yZGluYXRlcyhkYXRhLkhvdGVsU3VtbWFyeS5sYXRpdHVkZSwgZGF0YS5Ib3RlbFN1bW1hcnkubG9uZ2l0dWRlKTtcclxuICAgICAgICB9KTtcclxuICAgICRzY29wZS5nZXRCZWRUeXBlcyA9IGZ1bmN0aW9uKGJlZFR5cGVzKXtcclxuICAgICAgICBpZihiZWRUeXBlc1snQHNpemUnXSA+IDEpe1xyXG4gICAgICAgICAgICByZXR1cm4gJzxpIGNsYXNzPVwiZmEtbGkgZmEgZmEtYmVkXCI+PC9pPicrYmVkVHlwZXMuQmVkVHlwZVswXS5kZXNjcmlwdGlvbisnPGkgY2xhc3M9XCJmYS1saSBmYSBmYS1iZWRcIj48L2k+JytiZWRUeXBlcy5CZWRUeXBlWzFdLmRlc2NyaXB0aW9uO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnPGkgY2xhc3M9XCJmYS1saSBmYSBmYS1iZWRcIj48L2k+JytiZWRUeXBlcy5CZWRUeXBlLmRlc2NyaXB0aW9uO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvLyBWYWx1ZSBBZGRzXHJcbiAgICAkc2NvcGUudmFsdWVBZGRJY29uR2VuZXJhdG9yID0gZnVuY3Rpb24odmFsdWVBZGQpe1xyXG4gICAgICAgIHJldHVybiBWYWx1ZUFkZHMuZ2VuZXJhdGVJY29uKHZhbHVlQWRkKTtcclxuICAgIH07XHJcblxyXG4gICAgJHNjb3BlLnNlbGVjdFJvb20gPSBmdW5jdGlvbihyb29tKXtcclxuICAgICAgICB2YXIgcmF0ZUtleSA9IHJvb20uUmF0ZUluZm9zLlJhdGVJbmZvLlJvb21Hcm91cC5Sb29tLnJhdGVLZXk7XHJcbiAgICAgICAgdmFyIHJvb21UeXBlQ29kZSA9IHJvb20ucm9vbVR5cGVDb2RlO1xyXG4gICAgICAgIHZhciByYXRlQ29kZSA9IHJvb20ucmF0ZUNvZGU7XHJcbiAgICAgICAgdmFyIGNoYXJnZWFibGVSYXRlID0gZW5jb2RlVVJJQ29tcG9uZW50KHJvb20uUmF0ZUluZm9zLlJhdGVJbmZvLkNoYXJnZWFibGVSYXRlSW5mb1snQHRvdGFsJ10pO1xyXG5cclxuICAgICAgICAkbG9jYXRpb24ucGF0aCgnL2Jvb2svJytob3RlbElkKycvJytjaGVja0luKycvJytjaGVja091dCsnLycrcmF0ZUtleSsnLycrcm9vbVR5cGVDb2RlKycvJytyYXRlQ29kZSsnLycrY2hhcmdlYWJsZVJhdGUpO1xyXG4gICAgfTtcclxufV0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb250cm9sbGVyKCdCb29rQ3RybCcsIFsnJHNjb3BlJywgJyRodHRwJywgJyRyb3V0ZVBhcmFtcycsICckbG9jYXRpb24nLCBmdW5jdGlvbigkc2NvcGUsICRodHRwLCAkcm91dGVQYXJhbXMsICRsb2NhdGlvbil7XHJcbiAgICB2YXIgaG90ZWxJZCA9ICRyb3V0ZVBhcmFtcy5ob3RlbElkO1xyXG4gICAgdmFyIGNoZWNrSW4gPSAkcm91dGVQYXJhbXMuY2hlY2tJbjtcclxuICAgIHZhciBjaGVja091dCA9ICRyb3V0ZVBhcmFtcy5jaGVja091dDtcclxuICAgIHZhciByYXRlS2V5ID0gJHJvdXRlUGFyYW1zLnJhdGVLZXk7XHJcbiAgICB2YXIgcm9vbVR5cGVDb2RlID0gJHJvdXRlUGFyYW1zLnJvb21UeXBlQ29kZTtcclxuICAgIHZhciByYXRlQ29kZSA9ICRyb3V0ZVBhcmFtcy5yYXRlQ29kZTtcclxuICAgIHZhciBjaGFyZ2VhYmxlUmF0ZSA9IGVuY29kZVVSSUNvbXBvbmVudCgkcm91dGVQYXJhbXMuY2hhcmdlYWJsZVJhdGUpO1xyXG5cclxuICAgICRzY29wZS5ib29raW5nID0ge1xyXG4gICAgICAgIGZpcnN0TmFtZTogJ3Rlc3QnLFxyXG4gICAgICAgIGxhc3ROYW1lOiAnYm9va2luZycsXHJcbiAgICAgICAgZW1haWw6ICdib2dkYW5kb3JjYUBnbWFpbC5jb20nLFxyXG4gICAgICAgIHBob25lOiAnMDA0MDc2MzE5MTU0MycsXHJcbiAgICAgICAgY2FyZE51bWJlcjogJzU0MDE5OTk5OTk5OTk5OTknLFxyXG4gICAgICAgIGNhcmRUeXBlOiAnQ0EnLFxyXG4gICAgICAgIGNhcmRDdnY6ICcxMjMnLFxyXG4gICAgICAgIGNhcmRNb250aDogJzA2JyxcclxuICAgICAgICBjYXJkWWVhcjogJzIwMTcnLFxyXG4gICAgICAgIGNhcmRGaXJzdE5hbWU6ICdUZXN0JyxcclxuICAgICAgICBjYXJkTGFzdE5hbWU6ICdCb29raW5nJyxcclxuICAgICAgICBhZGRyZXNzOiAndHJhdmVsbm93JyxcclxuICAgICAgICBjaXR5OiAndHJhdmVsbm93JyxcclxuICAgICAgICBwcm92aW5jZTogJycsXHJcbiAgICAgICAgY291bnRyeTogJ1JPJyxcclxuICAgICAgICBwb3N0YWxDb2RlOiAnNTE1NDAwJ1xyXG4gICAgfTtcclxuICAgICRzY29wZS5ib29rID0gZnVuY3Rpb24oYm9va2luZyl7XHJcbiAgICAgICAgJGh0dHAucG9zdCgnL2FwaS9ib29rLycraG90ZWxJZCsnLycrY2hlY2tJbisnLycrY2hlY2tPdXQrJy8nK3JhdGVLZXkrJy8nK3Jvb21UeXBlQ29kZSsnLycrcmF0ZUNvZGUrJy8nK2NoYXJnZWFibGVSYXRlLCB7XHJcbiAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICAgIGZpcnN0TmFtZTogJHNjb3BlLmJvb2tpbmcuZmlyc3ROYW1lLFxyXG4gICAgICAgICAgICAgICAgbGFzdE5hbWU6ICRzY29wZS5ib29raW5nLmxhc3ROYW1lLFxyXG4gICAgICAgICAgICAgICAgZW1haWw6ICRzY29wZS5ib29raW5nLmVtYWlsLFxyXG4gICAgICAgICAgICAgICAgcGhvbmU6ICRzY29wZS5ib29raW5nLnBob25lLFxyXG4gICAgICAgICAgICAgICAgY2FyZE51bWJlcjogJHNjb3BlLmJvb2tpbmcuY2FyZE51bWJlcixcclxuICAgICAgICAgICAgICAgIGNhcmRUeXBlOiAkc2NvcGUuYm9va2luZy5jYXJkVHlwZSxcclxuICAgICAgICAgICAgICAgIGNhcmRDdnY6ICRzY29wZS5ib29raW5nLmNhcmRDdnYsXHJcbiAgICAgICAgICAgICAgICBjYXJkTW9udGg6ICRzY29wZS5ib29raW5nLmNhcmRNb250aCxcclxuICAgICAgICAgICAgICAgIGNhcmRZZWFyOiAkc2NvcGUuYm9va2luZy5jYXJkWWVhcixcclxuICAgICAgICAgICAgICAgIGNhcmRGaXJzdE5hbWU6ICRzY29wZS5ib29raW5nLmNhcmRGaXJzdE5hbWUsXHJcbiAgICAgICAgICAgICAgICBjYXJkTGFzdE5hbWU6ICRzY29wZS5ib29raW5nLmNhcmRMYXN0TmFtZSxcclxuICAgICAgICAgICAgICAgIGFkZHJlc3M6ICRzY29wZS5ib29raW5nLmFkZHJlc3MsXHJcbiAgICAgICAgICAgICAgICBjaXR5OiAkc2NvcGUuYm9va2luZy5jaXR5LFxyXG4gICAgICAgICAgICAgICAgcHJvdmluY2U6ICRzY29wZS5ib29raW5nLnByb3ZpbmNlLFxyXG4gICAgICAgICAgICAgICAgY291bnRyeTogJHNjb3BlLmJvb2tpbmcuY291bnRyeSxcclxuICAgICAgICAgICAgICAgIHBvc3RhbENvZGU6ICRzY29wZS5ib29raW5nLnBvc3RhbENvZGVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICAgICAgICAgICAgZGF0YSA9IGRhdGEuSG90ZWxSb29tUmVzZXJ2YXRpb25SZXNwb25zZTtcclxuICAgICAgICAgICAgICAgIHZhciBpdGluZXJhcnlJZCA9IGRhdGEuaXRpbmVyYXJ5SWQ7XHJcbiAgICAgICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnL2NvbmZpcm1hdGlvbi8nK2l0aW5lcmFyeUlkKycvJyskc2NvcGUuYm9va2luZy5lbWFpbCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5lcnJvcihmdW5jdGlvbihlcnIpe1xyXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogZXJyb3IgY2F0Y2hcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9O1xyXG59XSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbnRyb2xsZXIoJ0NvbmZpcm1hdGlvbkN0cmwnLCBbJyRzY29wZScsICckaHR0cCcsICckcm91dGVQYXJhbXMnLCBmdW5jdGlvbigkc2NvcGUsICRodHRwLCAkcm91dGVQYXJhbXMpe1xyXG4gICAgdmFyIGl0aW5lcmFyeUlkID0gJHJvdXRlUGFyYW1zLml0aW5lcmFyeUlkLFxyXG4gICAgICAgIGVtYWlsID0gJHJvdXRlUGFyYW1zLmVtYWlsO1xyXG4gICAgJHNjb3BlLmhlYWRpbmcgPSBpdGluZXJhcnlJZDtcclxuICAgICRodHRwLmdldCgnL2FwaS9pdGluZXJhcnkvJytpdGluZXJhcnlJZCsnLycrZW1haWwpXHJcbiAgICAgICAgLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSl7XHJcbiAgICAgICAgICAgIGRhdGEgPSBkYXRhLkhvdGVsSXRpbmVyYXJ5UmVzcG9uc2U7XHJcbiAgICAgICAgICAgICRzY29wZS5oZWFkaW5nID0gZGF0YS5JdGluZXJhcnkuaXRpbmVyYXJ5SWQ7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuZXJyb3IoZnVuY3Rpb24oZXJyKXtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcclxuICAgICAgICB9KTtcclxufV0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb250cm9sbGVyKCdMaXN0Q3RybCcsIFsnJHNjb3BlJywgJyRodHRwJywgJyRyb3V0ZVBhcmFtcycsICckbG9jYXRpb24nLCAnSG90ZWxMaXN0JywgJ0VhbkltYWdlJywgZnVuY3Rpb24oJHNjb3BlLCAkaHR0cCwgJHJvdXRlUGFyYW1zLCAkbG9jYXRpb24sIEhvdGVsTGlzdCwgRWFuSW1hZ2Upe1xyXG4gICAgJHNjb3BlLmhvdGVsTGlzdCA9IFtdO1xyXG4gICAgJHNjb3BlLnRpdGxlID0gJ1NlbGVjdCB5b3VyIGZhdm9yaXRlIGhvdGVsJztcclxuICAgICRzY29wZS50cmFuc2xhdGUgPSBmdW5jdGlvbihpbWFnZVVybCl7XHJcbiAgICAgICAgcmV0dXJuIEVhbkltYWdlLnRyYW5zbGF0ZShpbWFnZVVybCwgJ3QnLCAnbCcpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBQYXJhbXNcclxuICAgIHZhciB0eXBlID0gJHJvdXRlUGFyYW1zLnR5cGU7XHJcbiAgICB2YXIgZGVzdGluYXRpb25JZCA9ICRyb3V0ZVBhcmFtcy5kZXN0aW5hdGlvbjtcclxuICAgIHZhciBjaGVja0luID0gJHJvdXRlUGFyYW1zLmNoZWNrSW47XHJcbiAgICB2YXIgY2hlY2tPdXQgPSAkcm91dGVQYXJhbXMuY2hlY2tPdXQ7XHJcbiAgICBIb3RlbExpc3QuZ2V0SG90ZWxMaXN0KHR5cGUsIGRlc3RpbmF0aW9uSWQsIGNoZWNrSW4sIGNoZWNrT3V0KS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICAgIGlmKCFkYXRhLkVhbldzRXJyb3Ipe1xyXG4gICAgICAgICAgICBpZih0eXBlPT09J2hvdGVsJyl7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuaG90ZWxTZWxlY3QoZGF0YS5Ib3RlbExpc3QuSG90ZWxTdW1tYXJ5LmhvdGVsSWQpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYoZGF0YS5Ib3RlbExpc3QuSG90ZWxTdW1tYXJ5LmNvbnN0cnVjdG9yID09PSBBcnJheSl7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuaG90ZWxMaXN0ID0gZGF0YS5Ib3RlbExpc3QuSG90ZWxTdW1tYXJ5O1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmhvdGVsTGlzdC5wdXNoKGRhdGEuSG90ZWxMaXN0LkhvdGVsU3VtbWFyeSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBhbGVydCgnSW5jb3JyZWN0IGluZm8nKTtcclxuICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy8nKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIEhvdGVsTGlzdC5nZXREZXN0aW5hdGlvbkRldGFpbHMoZGVzdGluYXRpb25JZCkudGhlbihmdW5jdGlvbihkYXRhKXtcclxuICAgICAgICAkc2NvcGUudGl0bGUgPSBkYXRhLk5hbWU7XHJcbiAgICB9KTtcclxuICAgICRzY29wZS5ob3RlbFNlbGVjdCA9IGZ1bmN0aW9uKGhvdGVsSWQpe1xyXG4gICAgICAgICRsb2NhdGlvbi5wYXRoKCcvYXZhaWwvJytob3RlbElkKycvJytjaGVja0luKycvJytjaGVja091dCk7XHJcbiAgICB9O1xyXG59XSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbnRyb2xsZXIoJ1NlYXJjaEN0cmwnLCBbJyRzY29wZScsICckbG9jYXRpb24nLCAnUG9wdWxhckRlc3RpbmF0aW9ucycsICdEYXRlUGlja2VyJywgJ1RvYXN0cicsIGZ1bmN0aW9uKCRzY29wZSwgJGxvY2F0aW9uLCBQb3B1bGFyRGVzdGluYXRpb25zLCBEYXRlUGlja2VyLCBUb2FzdHIpe1xyXG4gICAgLy8gQ2hlY2staW5cclxuICAgICRzY29wZS5jaWR0ID0gRGF0ZVBpY2tlci5uZXdEYXRlKDEsIDAsIDAsICdkZC9tbS95eXl5Jyk7XHJcbiAgICAkc2NvcGUuY2hlY2tJbk1pbkRhdGUgPSAkc2NvcGUuY2hlY2tJbk1pbkRhdGUgPyBudWxsIDogbmV3IERhdGUoRGF0ZVBpY2tlci5uZXdEYXRlKDEsIDAsIDAsICdtbS9kZC95eXl5JykpO1xyXG4gICAgJHNjb3BlLmNoZWNrSW5NYXhEYXRlID0gbmV3IERhdGUoRGF0ZVBpY2tlci5uZXdEYXRlKDEsIDMsIDAsICdtbS9kZC95eXl5JykpO1xyXG5cclxuICAgICRzY29wZS5jb2R0ID0gRGF0ZVBpY2tlci5uZXdEYXRlKDMsIDAsIDAsICdkZC9tbS95eXl5Jyk7XHJcbiAgICAkc2NvcGUuY2hlY2tPdXRNaW5EYXRlID0gJHNjb3BlLmNoZWNrT3V0TWluRGF0ZSA/IG51bGwgOiBuZXcgRGF0ZShEYXRlUGlja2VyLm5ld0RhdGUoMywgMCwgMCwgJ21tL2RkL3l5eXknKSk7XHJcbiAgICAkc2NvcGUuY2hlY2tPdXRNYXhEYXRlID0gbmV3IERhdGUoRGF0ZVBpY2tlci5uZXdEYXRlKDIsIDMsIDAsICdtbS9kZC95eXl5JykpO1xyXG5cclxuXHJcbiAgICAkc2NvcGUuY2hlY2tJbk9wZW5lZCA9IGZhbHNlO1xyXG4gICAgJHNjb3BlLmNoZWNrT3V0T3BlbmVkID0gZmFsc2U7XHJcblxyXG4gICAgJHNjb3BlLmRhdGVwaWNrZXJPcGVuID0gZnVuY3Rpb24oJGV2ZW50LCBwYW5lbCl7XHJcbiAgICAgICAgJGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICRzY29wZS5jaGVja0luT3BlbmVkID0gKHBhbmVsID09PSAnY2hlY2tJbicpO1xyXG4gICAgICAgICRzY29wZS5jaGVja091dE9wZW5lZCA9IChwYW5lbCA9PT0gJ2NoZWNrT3V0Jyk7XHJcbiAgICB9O1xyXG4gICAgJHNjb3BlLmRhdGVPcHRpb25zID0gRGF0ZVBpY2tlci5kYXRlT3B0aW9ucztcclxuICAgICRzY29wZS5mb3JtYXQgPSBEYXRlUGlja2VyLmZvcm1hdDtcclxuXHJcbiAgICAvLyBSZWNvbW1lbmRlZCBkZXN0aW5hdGlvbnNcclxuICAgICRzY29wZS5wb3B1bGFyRGVzdGluYXRpb25zID0gW107XHJcbiAgICAkc2NvcGUucG9wdWxhckRlc3RpbmF0aW9uc0xvYWRlciA9IHRydWU7XHJcbiAgICAvLyBEZWZhdWx0IGRhdGVzIHRvIHNlYXJjaCBmb3JcclxuICAgICRzY29wZS5kZWZhdWx0Q2hlY2tJbiA9IERhdGVQaWNrZXIubmV3RGF0ZSgyLCAwLCAwLCAnZGQtbW0teXl5eScpO1xyXG4gICAgJHNjb3BlLmRlZmF1bHRDaGVja091dCA9IERhdGVQaWNrZXIubmV3RGF0ZSg1LCAwLCAwLCAnZGQtbW0teXl5eScpO1xyXG4gICAgUG9wdWxhckRlc3RpbmF0aW9ucy5nZXRQb3B1bGFyRGVzdGluYXRpb25zKCkudGhlbihmdW5jdGlvbihkYXRhKXtcclxuICAgICAgICAkc2NvcGUucG9wdWxhckRlc3RpbmF0aW9ucyA9IGRhdGE7XHJcbiAgICAgICAgJHNjb3BlLnBvcHVsYXJEZXN0aW5hdGlvbnNMb2FkZXIgPSBmYWxzZTtcclxuICAgIH0pO1xyXG5cclxuXHJcbiAgICAvLyBGb3JtXHJcbiAgICAkc2NvcGUuc2VhcmNoSG90ZWxzID0gZnVuY3Rpb24oZGVzdGluYXRpb24sIGNoZWNrSW4sIGNoZWNrT3V0KXtcclxuICAgICAgICAvLyBUT0RPOiBTZXQtdXAgdmFsaWRhdGlvblxyXG4gICAgICAgIGlmKGRlc3RpbmF0aW9uICYmIGRlc3RpbmF0aW9uLlR5cGUgJiYgZGVzdGluYXRpb24uRGVzdGluYXRpb25JZCl7XHJcbiAgICAgICAgICAgIGlmKGNoZWNrSW4gJiYgY2hlY2tPdXQgKXtcclxuICAgICAgICAgICAgICAgIHRvYXN0ci5jbGVhcigpO1xyXG4gICAgICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy9saXN0LycrZGVzdGluYXRpb24uVHlwZSsnLycrZGVzdGluYXRpb24uRGVzdGluYXRpb25JZCsnLycrRGF0ZVBpY2tlci5yZXBsYWNlRGF0ZVNlcGFyYXRvcihjaGVja0luKSsnLycrRGF0ZVBpY2tlci5yZXBsYWNlRGF0ZVNlcGFyYXRvcihjaGVja091dCkpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgVG9hc3RyLmVycm9yVG9hc3QoJ1RoZSBkYXRlcyBzZWxlY3RlZCBhcmUgaW5jb3JyZWN0LicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgVG9hc3RyLmVycm9yVG9hc3QoJ1RoZSBkZXN0aW5hdGlvbiBlbnRlcmVkIGlzIGluY29ycmVjdC4nKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59XSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmZpbHRlcigndW5zYWZlJywgWyckc2NlJywgZnVuY3Rpb24oJHNjZSkgeyByZXR1cm4gJHNjZS50cnVzdEFzSHRtbDsgfV0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKS5kaXJlY3RpdmUoJ25nU3RhclJhdGluZycsIFtmdW5jdGlvbigpe1xyXG4gICAgdmFyIGxpbmtlciA9IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRyKXtcclxuICAgICAgICBzY29wZS5udW1iZXJPZlN0YXJzID0gYXR0ci5zdGFycztcclxuICAgIH07XHJcbiAgICB2YXIgZ2V0VGVtcGxhdGUgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIHZhciB0ZW1wbGF0ZVN0cnVjdHVyZSA9ICc8ZGl2IGNsYXNzPVwic3RhcnNcIj4nO1xyXG4gICAgICAgIHRlbXBsYXRlU3RydWN0dXJlICs9ICc8c3BhbiBuZy1zaG93PVwiKG51bWJlck9mU3RhcnMgPj0gMSkgfHwgbnVtYmVyT2ZTdGFycyA9PSAwLjVcIj4nICtcclxuICAgICAgICAgICAgICAgICc8aSBjbGFzcz1cImZhXCIgbmctY2xhc3M9XCJudW1iZXJPZlN0YXJzID09IDAuNSA/IFxcJ2ZhLXN0YXItaGFsZlxcJyA6IFxcJ2ZhLXN0YXJcXCdcIj48L2k+JyArXHJcbiAgICAgICAgICAgICc8L3NwYW4+JztcclxuICAgICAgICB0ZW1wbGF0ZVN0cnVjdHVyZSArPSAnPHNwYW4gbmctc2hvdz1cIihudW1iZXJPZlN0YXJzID49IDIpIHx8IG51bWJlck9mU3RhcnMgPT0gMS41XCI+JyArXHJcbiAgICAgICAgICAgICc8aSBjbGFzcz1cImZhXCIgbmctY2xhc3M9XCJudW1iZXJPZlN0YXJzID09IDEuNSA/IFxcJ2ZhLXN0YXItaGFsZlxcJyA6IFxcJ2ZhLXN0YXJcXCdcIj48L2k+JyArXHJcbiAgICAgICAgICAgICc8L3NwYW4+JztcclxuICAgICAgICB0ZW1wbGF0ZVN0cnVjdHVyZSArPSAnPHNwYW4gbmctc2hvdz1cIihudW1iZXJPZlN0YXJzID49IDMpIHx8IG51bWJlck9mU3RhcnMgPT0gMi41XCI+JyArXHJcbiAgICAgICAgICAgICc8aSBjbGFzcz1cImZhXCIgbmctY2xhc3M9XCJudW1iZXJPZlN0YXJzID09IDIuNSA/IFxcJ2ZhLXN0YXItaGFsZlxcJyA6IFxcJ2ZhLXN0YXJcXCdcIj48L2k+JyArXHJcbiAgICAgICAgICAgICc8L3NwYW4+JztcclxuICAgICAgICB0ZW1wbGF0ZVN0cnVjdHVyZSArPSAnPHNwYW4gbmctc2hvdz1cIihudW1iZXJPZlN0YXJzID49IDQpIHx8IG51bWJlck9mU3RhcnMgPT0gMy41XCI+JyArXHJcbiAgICAgICAgICAgICc8aSBjbGFzcz1cImZhXCIgbmctY2xhc3M9XCJudW1iZXJPZlN0YXJzID09IDMuNSA/IFxcJ2ZhLXN0YXItaGFsZlxcJyA6IFxcJ2ZhLXN0YXJcXCdcIj48L2k+JyArXHJcbiAgICAgICAgICAgICc8L3NwYW4+JztcclxuICAgICAgICB0ZW1wbGF0ZVN0cnVjdHVyZSArPSAnPHNwYW4gbmctc2hvdz1cIihudW1iZXJPZlN0YXJzID49IDUpIHx8IG51bWJlck9mU3RhcnMgPT0gNC41XCI+JyArXHJcbiAgICAgICAgICAgICc8aSBjbGFzcz1cImZhXCIgbmctY2xhc3M9XCJudW1iZXJPZlN0YXJzID09IDQuNSA/IFxcJ2ZhLXN0YXItaGFsZlxcJyA6IFxcJ2ZhLXN0YXJcXCdcIj48L2k+JyArXHJcbiAgICAgICAgICAgICc8L3NwYW4+JztcclxuICAgICAgICB0ZW1wbGF0ZVN0cnVjdHVyZSArPSAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlU3RydWN0dXJlO1xyXG4gICAgfTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICB0ZW1wbGF0ZTogZ2V0VGVtcGxhdGUoKSxcclxuICAgICAgICBsaW5rOiBsaW5rZXJcclxuICAgIH07XHJcbn1dKTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwJykuZmFjdG9yeSgnRGF0ZVBpY2tlcicsIFtmdW5jdGlvbigpe1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBmb3JtYXREYXRlOiBmdW5jdGlvbihkYXksIG1vbnRoLCB5ZWFyLCBmb3JtYXQpe1xyXG4gICAgICAgICAgICBpZihmb3JtYXQgPT09ICdkZC9tbS95eXl5Jyl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKGRheS50b1N0cmluZygpLmRtRm9ybWF0KCkpKycvJysobW9udGgudG9TdHJpbmcoKS5kbUZvcm1hdCgpKSsnLycreWVhcjtcclxuICAgICAgICAgICAgfSBlbHNlIGlmKGZvcm1hdCA9PT0gJ21tL2RkL3l5eXknKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiAobW9udGgudG9TdHJpbmcoKS5kbUZvcm1hdCgpKSsnLycrKGRheS50b1N0cmluZygpLmRtRm9ybWF0KCkpKycvJyt5ZWFyO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYoZm9ybWF0ID09PSAneXl5eS9tbS9kZCcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB5ZWFyICsgJy8nICsgKG1vbnRoLnRvU3RyaW5nKCkuZG1Gb3JtYXQoKSkgKyAnLycgKyAoZGF5LnRvU3RyaW5nKCkuZG1Gb3JtYXQoKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZihmb3JtYXQgPT09ICdkZC1tbS15eXl5Jykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIChkYXkudG9TdHJpbmcoKS5kbUZvcm1hdCgpKSsnLScrKG1vbnRoLnRvU3RyaW5nKCkuZG1Gb3JtYXQoKSkrJy0nK3llYXI7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZihmb3JtYXQgPT09ICdtbS1kZC15eXl5Jykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICgobW9udGgudG9TdHJpbmcoKS5kbUZvcm1hdCgpKSsnLScrZGF5LnRvU3RyaW5nKCkuZG1Gb3JtYXQoKSkrJy0nK3llYXI7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIG5ld0RhdGU6IGZ1bmN0aW9uKGRheURlbGF5LCBtb250aERlbGF5LCB5ZWFyRGVsYXksIGZvcm1hdCl7XHJcbiAgICAgICAgICAgIHZhciBkYXRlID0gbmV3IERhdGUoKTtcclxuICAgICAgICAgICAgZGF0ZS5zZXREYXRlKGRhdGUuZ2V0RGF0ZSgpICsgZGF5RGVsYXkpO1xyXG5cclxuICAgICAgICAgICAgdmFyIGRheSA9IGRhdGUuZ2V0RGF0ZSgpLnRvU3RyaW5nKCkuZG1Gb3JtYXQoKTtcclxuICAgICAgICAgICAgdmFyIG1vbnRoID0gKGRhdGUuZ2V0TW9udGgoKSArIDEgKyBtb250aERlbGF5KS50b1N0cmluZygpLmRtRm9ybWF0KCk7XHJcbiAgICAgICAgICAgIHZhciB5ZWFyID0gZGF0ZS5nZXRGdWxsWWVhcigpICsgeWVhckRlbGF5O1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZm9ybWF0RGF0ZShkYXksIG1vbnRoLCB5ZWFyLCBmb3JtYXQpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVwbGFjZURhdGVTZXBhcmF0b3I6IGZ1bmN0aW9uKG9sZERhdGUpe1xyXG4gICAgICAgICAgICBpZihvbGREYXRlLmNvbnN0cnVjdG9yICE9PSBTdHJpbmcpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZm9ybWF0RGF0ZShvbGREYXRlLmdldERhdGUoKSwgKG9sZERhdGUuZ2V0TW9udGgoKSsxKSwgb2xkRGF0ZS5nZXRGdWxsWWVhcigpLCAnZGQtbW0teXl5eScpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9sZERhdGUucmVwbGFjZSgnLycsICctJykucmVwbGFjZSgnLycsICctJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGRhdGVPcHRpb25zOiB7XHJcbiAgICAgICAgICAgIGZvcm1hdFllYXI6ICd5eScsXHJcbiAgICAgICAgICAgIHN0YXJ0aW5nRGF5OiAxXHJcbiAgICAgICAgfSxcclxuICAgICAgICBmb3JtYXRzOiBbJ2RkL01NL3l5eXknLCAneXl5eS9NTS9kZCcsICdkZC9NTS95eXl5JywgJ3Nob3J0RGF0ZSddLFxyXG4gICAgICAgIGZvcm1hdDogJ2RkL01NL3l5eXknXHJcbiAgICB9O1xyXG59XSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmZhY3RvcnkoJ0hvdGVsTGlzdCcsIFsnJGh0dHAnLCAnJHEnLCBmdW5jdGlvbigkaHR0cCwgJHEpe1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBnZXRIb3RlbExpc3Q6IGZ1bmN0aW9uKHR5cGUsIGRlc3RpbmF0aW9uSWQsIGNoZWNrSW4sIGNoZWNrT3V0KXtcclxuICAgICAgICAgICAgdmFyIGRlZmVyID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgJGh0dHAuZ2V0KCcvYXBpL2xpc3QvJyt0eXBlKycvJytkZXN0aW5hdGlvbklkKycvJytjaGVja0luKycvJytjaGVja091dCsnLzInKVxyXG4gICAgICAgICAgICAgICAgLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSl7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoZGF0YS5sZW5ndGggIT09IDApe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlci5yZXNvbHZlKGRhdGEuSG90ZWxMaXN0UmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXIucHJvbWlzZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldERlc3RpbmF0aW9uRGV0YWlsczogZnVuY3Rpb24oZGVzdGluYXRpb25JZCl7XHJcbiAgICAgICAgICAgIHZhciBkZWZlciA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgICRodHRwLmdldCgnL2FwaS9kZXN0aW5hdGlvbi9kZXRhaWxzLycrZGVzdGluYXRpb25JZClcclxuICAgICAgICAgICAgICAgIC5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVyLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmVycm9yKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXIucmVzb2x2ZSgnU2VsZWN0IHlvdXIgZmF2b3JpdGUgaG90ZWwnKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXIucHJvbWlzZTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59XSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmZhY3RvcnkoJ0VhbkltYWdlJywgW2Z1bmN0aW9uKCl7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHRyYW5zbGF0ZTogZnVuY3Rpb24oaW1hZ2UsIGZyb20sIHRvKXtcclxuICAgICAgICAgICAgcmV0dXJuIGltYWdlLnJlcGxhY2UoJ18nK2Zyb20rJy5qcGcnLCAnXycrdG8rJy5qcGcnKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxufV0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKS5mYWN0b3J5KCdQb3B1bGFyRGVzdGluYXRpb25zJywgWyckaHR0cCcsICckcScsIGZ1bmN0aW9uKCRodHRwLCAkcSl7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGdldFBvcHVsYXJEZXN0aW5hdGlvbnM6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgICRodHRwLmdldCgnL2FwaS9wb3B1bGFyLzcnKVxyXG4gICAgICAgICAgICAgICAgLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSl7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGluZGVudFNlbGVjdGlvbjogZnVuY3Rpb24oZGVzdGluYXRpb25JZCl7XHJcbiAgICAgICAgICAgICRodHRwLnBvc3QoJy9hcGkvcG9wdWxhci8nK2Rlc3RpbmF0aW9uSWQsIHt9KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59XSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmZhY3RvcnkoJ1RvYXN0cicsIFtmdW5jdGlvbigpe1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzVG9hc3Q6IGZ1bmN0aW9uKG1lc3NhZ2Upe1xyXG4gICAgICAgICAgICB0b2FzdHIub3B0aW9ucy5jbG9zZUJ1dHRvbiA9IHRydWU7XHJcbiAgICAgICAgICAgIHRvYXN0ci5vcHRpb25zLnByZXZlbnREdXBsaWNhdGVzID0gdHJ1ZTtcclxuICAgICAgICAgICAgdG9hc3RyLnN1Y2Nlc3MobWVzc2FnZSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlcnJvclRvYXN0OiBmdW5jdGlvbihtZXNzYWdlKXtcclxuICAgICAgICAgICAgdG9hc3RyLm9wdGlvbnMuY2xvc2VCdXR0b24gPSB0cnVlO1xyXG4gICAgICAgICAgICB0b2FzdHIub3B0aW9ucy5wcmV2ZW50RHVwbGljYXRlcyA9IHRydWU7XHJcbiAgICAgICAgICAgIHRvYXN0ci5lcnJvcihtZXNzYWdlKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59XSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmZhY3RvcnkoJ1ZhbHVlQWRkcycsIFtmdW5jdGlvbigpe1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBnZW5lcmF0ZUljb246IGZ1bmN0aW9uKHZhbHVlQWRkKXtcclxuICAgICAgICAgICAgaWYodmFsdWVBZGQgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlQWRkLmluZGV4T2YoJ0JyZWFrZmFzdCcpID4gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJzxpIGNsYXNzPVwiZmEgZmEtY3V0bGVyeSBmYS1saVwiPjwvaT4gJyArIHZhbHVlQWRkO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZUFkZC5pbmRleE9mKCdXaXJlbGVzcycpID4gLTEgfHwgdmFsdWVBZGQuaW5kZXhPZignSW50ZXJuZXQnKSA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICc8aSBjbGFzcz1cImZhIGZhLXdpZmkgZmEtbGlcIj48L2k+ICcgKyB2YWx1ZUFkZDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWVBZGQuaW5kZXhPZignUGFya2luZycpID4gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJzxpIGNsYXNzPVwiZmEgZmEtY2FyIGZhLWxpXCI+PC9pPiAnICsgdmFsdWVBZGQ7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnPGkgY2xhc3M9XCJmYSBmYS1tb25leSBmYS1saVwiPjwvaT4gJyArIHZhbHVlQWRkO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufV0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKS5kaXJlY3RpdmUoJ25nQXV0b2NvbXBsZXRlJywgWyckZG9jdW1lbnQnLCAnJGh0dHAnLCAnUG9wdWxhckRlc3RpbmF0aW9ucycsIGZ1bmN0aW9uKCRkb2N1bWVudCwgJGh0dHAsIFBvcHVsYXJEZXN0aW5hdGlvbnMpe1xyXG4gICAgdmFyIGxpbmtlciA9IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50KXtcclxuICAgICAgICAkZG9jdW1lbnQuY2xpY2soZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgc2NvcGUuJGFwcGx5KHNjb3BlLmhpZGVBdXRvY29tcGxldGUgPSB0cnVlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBlbGVtZW50LmNsaWNrKGZ1bmN0aW9uKGV2ZW50KXtcclxuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgdmFyIGNvbnRyb2xsZXIgPSBmdW5jdGlvbigkc2NvcGUpe1xyXG4gICAgICAgICRzY29wZS5hdXRvY29tcGxldGVMaXN0ID0ge1xyXG4gICAgICAgICAgICBjaXRpZXM6IFtdLFxyXG4gICAgICAgICAgICBob3RlbHM6IFtdLFxyXG4gICAgICAgICAgICBhaXJwb3J0czogW11cclxuICAgICAgICB9O1xyXG4gICAgICAgIHZhciByZXNldEF1dG9jb21wbGV0ZSA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICRzY29wZS5hdXRvY29tcGxldGVMaXN0ID0ge1xyXG4gICAgICAgICAgICAgICAgY2l0aWVzOiBbXSxcclxuICAgICAgICAgICAgICAgIGhvdGVsczogW10sXHJcbiAgICAgICAgICAgICAgICBhaXJwb3J0czogW11cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBHZXQgYXV0b2NvbXBsZXRlIGxpc3RcclxuICAgICAgICAkc2NvcGUuYXV0b2NvbXBsZXRlID0gZnVuY3Rpb24oZGVzdGluYXRpb24pe1xyXG4gICAgICAgICAgICBpZihkZXN0aW5hdGlvbi5sZW5ndGggPiAyKXtcclxuICAgICAgICAgICAgICAgICRodHRwLmdldCgnL2FwaS9hdXRvY29tcGxldGUvJytkZXN0aW5hdGlvbilcclxuICAgICAgICAgICAgICAgICAgICAuc3VjY2VzcyhmdW5jdGlvbihkYXRhKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzZXRBdXRvY29tcGxldGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBpPTA7aTxkYXRhLmxlbmd0aDtpKyspe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoZGF0YVtpXS5UeXBlID09PSAnY2l0eScpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5hdXRvY29tcGxldGVMaXN0LmNpdGllcy5wdXNoKGRhdGFbaV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmKGRhdGFbaV0uVHlwZSA9PT0gJ2hvdGVsJyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmF1dG9jb21wbGV0ZUxpc3QuaG90ZWxzLnB1c2goZGF0YVtpXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYoZGF0YVtpXS5UeXBlID09PSAnYWlycG9ydCcpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5hdXRvY29tcGxldGVMaXN0LmFpcnBvcnRzLnB1c2goZGF0YVtpXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuaGlkZUF1dG9jb21wbGV0ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXNldEF1dG9jb21wbGV0ZSgpO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmhpZGVBdXRvY29tcGxldGUgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gQ2F0ZWdvcnkgaGlkZVxyXG4gICAgICAgICRzY29wZS5jaXRpZXNBcnJheUlzRW1wdHkgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICByZXR1cm4gKCRzY29wZS5hdXRvY29tcGxldGVMaXN0LmNpdGllcy5sZW5ndGggPT09IDApO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgJHNjb3BlLmhvdGVsc0FycmF5SXNFbXB0eSA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHJldHVybiAoJHNjb3BlLmF1dG9jb21wbGV0ZUxpc3QuaG90ZWxzLmxlbmd0aCA9PT0gMCk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICAkc2NvcGUuYWlycG9ydHNBcnJheUlzRW1wdHkgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICByZXR1cm4gKCRzY29wZS5hdXRvY29tcGxldGVMaXN0LmFpcnBvcnRzLmxlbmd0aCA9PT0gMCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gQXV0b2NvbXBsZXRlIGhpZGVcclxuICAgICAgICAkc2NvcGUuaGlkZUF1dG9jb21wbGV0ZSA9IHRydWU7XHJcbiAgICAgICAgdmFyIGF1dG9jb21wbGV0ZUxpc3RJc0VtcHR5ID0gZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgcmV0dXJuICgkc2NvcGUuYXV0b2NvbXBsZXRlTGlzdC5jaXRpZXMubGVuZ3RoID09PSAwICYmICRzY29wZS5hdXRvY29tcGxldGVMaXN0LmhvdGVscy5sZW5ndGggPT09IDAgJiYgJHNjb3BlLmF1dG9jb21wbGV0ZUxpc3QuYWlycG9ydHMubGVuZ3RoID09PSAwKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgICRzY29wZS5hdXRvY29tcGxldGVJc0hpZGRlbiA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHJldHVybiAoYXV0b2NvbXBsZXRlTGlzdElzRW1wdHkoKSB8fCAkc2NvcGUuaGlkZUF1dG9jb21wbGV0ZSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gQXV0b2NvbXBsZXRlIHNlbGVjdFxyXG4gICAgICAgICRzY29wZS5zZWxlY3REZXN0aW5hdGlvbiA9IGZ1bmN0aW9uKGl0ZW0sIHR5cGUpe1xyXG4gICAgICAgICAgICAkc2NvcGUuZGVzdGluYXRpb24gPSBpdGVtLk5hbWU7XHJcbiAgICAgICAgICAgICRzY29wZS5zZWxlY3RlZERlc3RpbmF0aW9uID0gaXRlbTtcclxuICAgICAgICAgICAgUG9wdWxhckRlc3RpbmF0aW9ucy5pbmRlbnRTZWxlY3Rpb24oaXRlbS5EZXN0aW5hdGlvbklkKTtcclxuICAgICAgICAgICAgcmVzZXRBdXRvY29tcGxldGUoKTtcclxuICAgICAgICB9O1xyXG4gICAgfTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgICAgICBsaW5rOiBsaW5rZXIsXHJcbiAgICAgICAgY29udHJvbGxlcjogY29udHJvbGxlcixcclxuICAgICAgICB0ZW1wbGF0ZVVybDogJy4vcGFydGlhbHMvaW5kZXgvYXV0b2NvbXBsZXRlJ1xyXG4gICAgfTtcclxufV0pOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==