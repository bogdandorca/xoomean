angular.module('app', ['ngRoute', 'ui.bootstrap', 'ngAnimate', 'uiGmapgoogle-maps']).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
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
            void 0;
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
                void 0;
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
            void 0;
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
            return bedTypes.BedType[0].description+' / '+bedTypes.BedType[1].description;
        } else {
            return bedTypes.BedType.description;
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
            void 0;
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
        if(type==='hotel'){
            $scope.hotelSelect(data.HotelList.HotelSummary.hotelId);
        }
        // remove the loader
        if(data.HotelList.HotelSummary.constructor === Array){
            $scope.hotelList = data.HotelList.HotelSummary;
        } else {
            $scope.hotelList.push(data.HotelList.HotelSummary);
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
                    return '<i class="fa fa-cutlery"></i> ' + valueAdd;
                } else if (valueAdd.indexOf('Wireless') > -1 || valueAdd.indexOf('Internet') > -1) {
                    return '<i class="fa fa-wifi"></i> ' + valueAdd;
                } else if (valueAdd.indexOf('Parking') > -1) {
                    return '<i class="fa fa-car"></i> ' + valueAdd;
                } else {
                    return '<i class="fa fa-money"></i> ' + valueAdd;
                }
            }
        }
    };
}]);
angular.module('app').filter('unsafe', ['$sce', function($sce) { return $sce.trustAsHtml; }]);
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
String.prototype.dmFormat = function(){
    if(this.length === 1){
        return '0'+this;
    } else {
        return this;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImRpcmVjdGl2ZXMvc3RhclJhdGluZy5qcyIsImNvbnRyb2xsZXJzL2F2YWlsQ29udHJvbGxlci5qcyIsImNvbnRyb2xsZXJzL2Jvb2tDb250cm9sbGVyLmpzIiwiY29udHJvbGxlcnMvY29uZmlybWF0aW9uQ29udHJvbGxlci5qcyIsImNvbnRyb2xsZXJzL2xpc3RDb250cm9sbGVyLmpzIiwiY29udHJvbGxlcnMvc2VhcmNoQ29udHJvbGxlci5qcyIsInNlcnZpY2VzL2RhdGVwaWNrZXJTZXJ2aWNlLmpzIiwic2VydmljZXMvaG90ZWxMaXN0U2VydmljZS5qcyIsInNlcnZpY2VzL2ltYWdlU2VydmljZS5qcyIsInNlcnZpY2VzL3BvcHVsYXJEZXN0aW5hdGlvbnMuanMiLCJzZXJ2aWNlcy90b2FzdHJTZXJ2aWNlLmpzIiwic2VydmljZXMvdmFsdWVBZGRzU2VydmljZS5qcyIsImZpbHRlcnMvaGVscGVycy5qcyIsImRpcmVjdGl2ZXMvYXV0b2NvbXBsZXRlL2F1dG9jb21wbGV0ZS5qcyIsImFpcnBsYW5lcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQkE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYXBwbGljYXRpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJhbmd1bGFyLm1vZHVsZSgnYXBwJywgWyduZ1JvdXRlJywgJ3VpLmJvb3RzdHJhcCcsICduZ0FuaW1hdGUnLCAndWlHbWFwZ29vZ2xlLW1hcHMnXSkuY29uZmlnKFsnJHJvdXRlUHJvdmlkZXInLCAnJGxvY2F0aW9uUHJvdmlkZXInLCBmdW5jdGlvbigkcm91dGVQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIpe1xyXG4gICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpO1xyXG4gICAgJHJvdXRlUHJvdmlkZXJcclxuICAgICAgICAud2hlbignLycsIHtcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvcGFydGlhbHMvaW5kZXgvc2VhcmNoJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ1NlYXJjaEN0cmwnXHJcbiAgICAgICAgfSlcclxuICAgICAgICAud2hlbignL2xpc3QvOnR5cGUvOmRlc3RpbmF0aW9uLzpjaGVja0luLzpjaGVja091dCcsIHtcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvcGFydGlhbHMvbGlzdC9saXN0JyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0xpc3RDdHJsJ1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLndoZW4oJy9hdmFpbC86aG90ZWxJZC86Y2hlY2tJbi86Y2hlY2tPdXQnLCB7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL3BhcnRpYWxzL2F2YWlsL2F2YWlsJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0F2YWlsQ3RybCdcclxuICAgICAgICB9KVxyXG4gICAgICAgIC53aGVuKCcvYm9vay86aG90ZWxJZC86Y2hlY2tJbi86Y2hlY2tPdXQvOnJhdGVLZXkvOnJvb21UeXBlQ29kZS86cmF0ZUNvZGUvOmNoYXJnZWFibGVSYXRlJywge1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3BhcnRpYWxzL2Jvb2svYm9vaycsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdCb29rQ3RybCdcclxuICAgICAgICB9KVxyXG4gICAgICAgIC53aGVuKCcvY29uZmlybWF0aW9uLzppdGluZXJhcnlJZC86ZW1haWwnLCB7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAncGFydGlhbHMvY29uZmlybWF0aW9uL2NvbmZpcm1hdGlvbicsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdDb25maXJtYXRpb25DdHJsJ1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLm90aGVyd2lzZSh7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAncGFydGlhbHMvNDA0J1xyXG4gICAgICAgIH0pO1xyXG59XSk7XHJcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKS5kaXJlY3RpdmUoJ25nU3RhclJhdGluZycsIFtmdW5jdGlvbigpe1xyXG4gICAgdmFyIGxpbmtlciA9IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRyKXtcclxuICAgICAgICBzY29wZS5udW1iZXJPZlN0YXJzID0gYXR0ci5zdGFycztcclxuICAgIH07XHJcbiAgICB2YXIgZ2V0VGVtcGxhdGUgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIHZhciB0ZW1wbGF0ZVN0cnVjdHVyZSA9ICc8ZGl2IGNsYXNzPVwic3RhcnNcIj4nO1xyXG4gICAgICAgIHRlbXBsYXRlU3RydWN0dXJlICs9ICc8c3BhbiBuZy1zaG93PVwiKG51bWJlck9mU3RhcnMgPj0gMSkgfHwgbnVtYmVyT2ZTdGFycyA9PSAwLjVcIj4nICtcclxuICAgICAgICAgICAgICAgICc8aSBjbGFzcz1cImZhXCIgbmctY2xhc3M9XCJudW1iZXJPZlN0YXJzID09IDAuNSA/IFxcJ2ZhLXN0YXItaGFsZlxcJyA6IFxcJ2ZhLXN0YXJcXCdcIj48L2k+JyArXHJcbiAgICAgICAgICAgICc8L3NwYW4+JztcclxuICAgICAgICB0ZW1wbGF0ZVN0cnVjdHVyZSArPSAnPHNwYW4gbmctc2hvdz1cIihudW1iZXJPZlN0YXJzID49IDIpIHx8IG51bWJlck9mU3RhcnMgPT0gMS41XCI+JyArXHJcbiAgICAgICAgICAgICc8aSBjbGFzcz1cImZhXCIgbmctY2xhc3M9XCJudW1iZXJPZlN0YXJzID09IDEuNSA/IFxcJ2ZhLXN0YXItaGFsZlxcJyA6IFxcJ2ZhLXN0YXJcXCdcIj48L2k+JyArXHJcbiAgICAgICAgICAgICc8L3NwYW4+JztcclxuICAgICAgICB0ZW1wbGF0ZVN0cnVjdHVyZSArPSAnPHNwYW4gbmctc2hvdz1cIihudW1iZXJPZlN0YXJzID49IDMpIHx8IG51bWJlck9mU3RhcnMgPT0gMi41XCI+JyArXHJcbiAgICAgICAgICAgICc8aSBjbGFzcz1cImZhXCIgbmctY2xhc3M9XCJudW1iZXJPZlN0YXJzID09IDIuNSA/IFxcJ2ZhLXN0YXItaGFsZlxcJyA6IFxcJ2ZhLXN0YXJcXCdcIj48L2k+JyArXHJcbiAgICAgICAgICAgICc8L3NwYW4+JztcclxuICAgICAgICB0ZW1wbGF0ZVN0cnVjdHVyZSArPSAnPHNwYW4gbmctc2hvdz1cIihudW1iZXJPZlN0YXJzID49IDQpIHx8IG51bWJlck9mU3RhcnMgPT0gMy41XCI+JyArXHJcbiAgICAgICAgICAgICc8aSBjbGFzcz1cImZhXCIgbmctY2xhc3M9XCJudW1iZXJPZlN0YXJzID09IDMuNSA/IFxcJ2ZhLXN0YXItaGFsZlxcJyA6IFxcJ2ZhLXN0YXJcXCdcIj48L2k+JyArXHJcbiAgICAgICAgICAgICc8L3NwYW4+JztcclxuICAgICAgICB0ZW1wbGF0ZVN0cnVjdHVyZSArPSAnPHNwYW4gbmctc2hvdz1cIihudW1iZXJPZlN0YXJzID49IDUpIHx8IG51bWJlck9mU3RhcnMgPT0gNC41XCI+JyArXHJcbiAgICAgICAgICAgICc8aSBjbGFzcz1cImZhXCIgbmctY2xhc3M9XCJudW1iZXJPZlN0YXJzID09IDQuNSA/IFxcJ2ZhLXN0YXItaGFsZlxcJyA6IFxcJ2ZhLXN0YXJcXCdcIj48L2k+JyArXHJcbiAgICAgICAgICAgICc8L3NwYW4+JztcclxuICAgICAgICB0ZW1wbGF0ZVN0cnVjdHVyZSArPSAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlU3RydWN0dXJlO1xyXG4gICAgfTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICB0ZW1wbGF0ZTogZ2V0VGVtcGxhdGUoKSxcclxuICAgICAgICBsaW5rOiBsaW5rZXJcclxuICAgIH07XHJcbn1dKTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwJykuY29udHJvbGxlcignQXZhaWxDdHJsJywgWyckc2NvcGUnLCAnJHJvdXRlUGFyYW1zJywgJyRodHRwJywgJyRsb2NhdGlvbicsICdWYWx1ZUFkZHMnLCAnRWFuSW1hZ2UnLCAnJHRpbWVvdXQnLCBmdW5jdGlvbigkc2NvcGUsICRyb3V0ZVBhcmFtcywgJGh0dHAsICRsb2NhdGlvbiwgVmFsdWVBZGRzLCBFYW5JbWFnZSwgJHRpbWVvdXQpe1xyXG4gICAgdmFyIGhvdGVsSWQgPSAkcm91dGVQYXJhbXMuaG90ZWxJZDtcclxuICAgIHZhciBjaGVja0luID0gJHJvdXRlUGFyYW1zLmNoZWNrSW47XHJcbiAgICB2YXIgY2hlY2tPdXQgPSAkcm91dGVQYXJhbXMuY2hlY2tPdXQ7XHJcblxyXG4gICAgJHNjb3BlLnJvb21zID0gW107XHJcbiAgICAkc2NvcGUuaG90ZWxOYW1lID0gJ0hvdGVsIERldGFpbHMnO1xyXG4gICAgJHNjb3BlLmNoZWNrSW5JbnN0cnVjdGlvbnMgPSAnJztcclxuICAgICRzY29wZS52YWx1ZUFkZHMgPSBbXTtcclxuICAgICRzY29wZS50cmFuc2xhdGUgPSBmdW5jdGlvbihpbWFnZVVybCwgZnJvbSwgdG8pe1xyXG4gICAgICAgIHJldHVybiBFYW5JbWFnZS50cmFuc2xhdGUoaW1hZ2VVcmwsIGZyb20sIHRvKTtcclxuICAgIH07XHJcbiAgICAkc2NvcGUubWFwID0ge1xyXG4gICAgICAgIHNob3c6IGZhbHNlLFxyXG4gICAgICAgIHJlZnJlc2g6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICRzY29wZS5tYXAuc2hvdyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUubWFwLnNob3cgPSB0cnVlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNlbnRlcjoge1xyXG4gICAgICAgICAgICBsYXRpdHVkZTogMCxcclxuICAgICAgICAgICAgbG9uZ2l0dWRlOiAwXHJcbiAgICAgICAgfSxcclxuICAgICAgICB6b29tOiAxMixcclxuICAgICAgICBtYXJrZXI6IHtcclxuICAgICAgICAgICAgaWQ6IDEsXHJcbiAgICAgICAgICAgIGNvb3Jkczoge1xyXG4gICAgICAgICAgICAgICAgbGF0aXR1ZGU6IDAsXHJcbiAgICAgICAgICAgICAgICBsb25naXR1ZGU6IDBcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2hvd1dpbmRvdzogdHJ1ZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0Q29vcmRpbmF0ZXM6IGZ1bmN0aW9uKGxhdCwgbG9uZyl7XHJcbiAgICAgICAgICAgIHRoaXMuY2VudGVyLmxhdGl0dWRlID0gbGF0O1xyXG4gICAgICAgICAgICB0aGlzLmNlbnRlci5sb25naXR1ZGUgPSBsb25nO1xyXG4gICAgICAgICAgICB0aGlzLm1hcmtlci5jb29yZHMubGF0aXR1ZGUgPSBsYXQ7XHJcbiAgICAgICAgICAgIHRoaXMubWFya2VyLmNvb3Jkcy5sb25naXR1ZGUgPSBsb25nO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAkaHR0cC5nZXQoJy9hcGkvYXZhaWwvJytob3RlbElkKycvJytjaGVja0luKycvJytjaGVja091dClcclxuICAgICAgICAuc3VjY2VzcyhmdW5jdGlvbihkYXRhKXtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XHJcbiAgICAgICAgICAgIGRhdGEgPSBkYXRhLkhvdGVsUm9vbUF2YWlsYWJpbGl0eVJlc3BvbnNlO1xyXG4gICAgICAgICAgICBpZihkYXRhWydAc2l6ZSddID4gMCl7XHJcbiAgICAgICAgICAgICAgICBpZihkYXRhLkhvdGVsUm9vbVJlc3BvbnNlLmNvbnN0cnVjdG9yID09PSBBcnJheSl7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnJvb21zID0gZGF0YS5Ib3RlbFJvb21SZXNwb25zZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnJvb21zLnB1c2goZGF0YS5Ib3RlbFJvb21SZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuaG90ZWxOYW1lID0gZGF0YS5ob3RlbE5hbWU7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuY2hlY2tJbkluc3RydWN0aW9ucyA9IGRhdGEuY2hlY2tJbkluc3RydWN0aW9ucztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGFsZXJ0KCdUaGVyZSBhcmUgbm8gcm9vbXMgYXZhaWxhYmxlIGZvciB0aGlzIGhvdGVsIGF2YWlsYWJsZScpO1xyXG4gICAgICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy8nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICRzY29wZS5ob3RlbEltYWdlcyA9IFtdO1xyXG4gICAgJHNjb3BlLnNlbGVjdGVkSG90ZWxJbWFnZSA9ICcnO1xyXG4gICAgJHNjb3BlLmFjdGl2ZUltYWdlID0gMDtcclxuICAgICRzY29wZS5jaGFuZ2VIb3RlbEltYWdlID0gZnVuY3Rpb24oaW1hZ2VJbmRleCl7XHJcbiAgICAgICAgJHNjb3BlLnNlbGVjdGVkSG90ZWxJbWFnZSA9ICRzY29wZS5ob3RlbEltYWdlc1tpbWFnZUluZGV4XS51cmw7XHJcbiAgICAgICAgJHNjb3BlLmFjdGl2ZUltYWdlID0gaW1hZ2VJbmRleDtcclxuICAgIH07XHJcbiAgICAkaHR0cC5nZXQoJy9hcGkvaG90ZWwvaW5mb3JtYXRpb24vJytob3RlbElkKVxyXG4gICAgICAgIC5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcclxuICAgICAgICAgICAgZGF0YSA9IGRhdGEuSG90ZWxJbmZvcm1hdGlvblJlc3BvbnNlO1xyXG4gICAgICAgICAgICAkc2NvcGUuaG90ZWxJbWFnZXMgPSBkYXRhLkhvdGVsSW1hZ2VzLkhvdGVsSW1hZ2U7XHJcbiAgICAgICAgICAgICRzY29wZS5zZWxlY3RlZEhvdGVsSW1hZ2UgPSAkc2NvcGUuaG90ZWxJbWFnZXNbMF0udXJsO1xyXG4gICAgICAgICAgICAkc2NvcGUucHJvcGVydHlEZXNjcmlwdGlvbiA9IGRhdGEuSG90ZWxEZXRhaWxzLnByb3BlcnR5RGVzY3JpcHRpb247XHJcbiAgICAgICAgICAgICRzY29wZS5hbWVuaXRpZXNEZXNjcmlwdGlvbiA9IGRhdGEuSG90ZWxEZXRhaWxzLmFtZW5pdGllc0Rlc2NyaXB0aW9uO1xyXG4gICAgICAgICAgICAkc2NvcGUuYXJlYUluZm8gPSBkYXRhLkhvdGVsRGV0YWlscy5hcmVhSW5mb3JtYXRpb247XHJcbiAgICAgICAgICAgICRzY29wZS5tYXAuc2V0Q29vcmRpbmF0ZXMoZGF0YS5Ib3RlbFN1bW1hcnkubGF0aXR1ZGUsIGRhdGEuSG90ZWxTdW1tYXJ5LmxvbmdpdHVkZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAkc2NvcGUuZ2V0QmVkVHlwZXMgPSBmdW5jdGlvbihiZWRUeXBlcyl7XHJcbiAgICAgICAgaWYoYmVkVHlwZXNbJ0BzaXplJ10gPiAxKXtcclxuICAgICAgICAgICAgcmV0dXJuIGJlZFR5cGVzLkJlZFR5cGVbMF0uZGVzY3JpcHRpb24rJyAvICcrYmVkVHlwZXMuQmVkVHlwZVsxXS5kZXNjcmlwdGlvbjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gYmVkVHlwZXMuQmVkVHlwZS5kZXNjcmlwdGlvbjtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLy8gVmFsdWUgQWRkc1xyXG4gICAgJHNjb3BlLnZhbHVlQWRkSWNvbkdlbmVyYXRvciA9IGZ1bmN0aW9uKHZhbHVlQWRkKXtcclxuICAgICAgICByZXR1cm4gVmFsdWVBZGRzLmdlbmVyYXRlSWNvbih2YWx1ZUFkZCk7XHJcbiAgICB9O1xyXG5cclxuICAgICRzY29wZS5zZWxlY3RSb29tID0gZnVuY3Rpb24ocm9vbSl7XHJcbiAgICAgICAgdmFyIHJhdGVLZXkgPSByb29tLlJhdGVJbmZvcy5SYXRlSW5mby5Sb29tR3JvdXAuUm9vbS5yYXRlS2V5O1xyXG4gICAgICAgIHZhciByb29tVHlwZUNvZGUgPSByb29tLnJvb21UeXBlQ29kZTtcclxuICAgICAgICB2YXIgcmF0ZUNvZGUgPSByb29tLnJhdGVDb2RlO1xyXG4gICAgICAgIHZhciBjaGFyZ2VhYmxlUmF0ZSA9IGVuY29kZVVSSUNvbXBvbmVudChyb29tLlJhdGVJbmZvcy5SYXRlSW5mby5DaGFyZ2VhYmxlUmF0ZUluZm9bJ0B0b3RhbCddKTtcclxuXHJcbiAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy9ib29rLycraG90ZWxJZCsnLycrY2hlY2tJbisnLycrY2hlY2tPdXQrJy8nK3JhdGVLZXkrJy8nK3Jvb21UeXBlQ29kZSsnLycrcmF0ZUNvZGUrJy8nK2NoYXJnZWFibGVSYXRlKTtcclxuICAgIH07XHJcbn1dKTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwJykuY29udHJvbGxlcignQm9va0N0cmwnLCBbJyRzY29wZScsICckaHR0cCcsICckcm91dGVQYXJhbXMnLCAnJGxvY2F0aW9uJywgZnVuY3Rpb24oJHNjb3BlLCAkaHR0cCwgJHJvdXRlUGFyYW1zLCAkbG9jYXRpb24pe1xyXG4gICAgdmFyIGhvdGVsSWQgPSAkcm91dGVQYXJhbXMuaG90ZWxJZDtcclxuICAgIHZhciBjaGVja0luID0gJHJvdXRlUGFyYW1zLmNoZWNrSW47XHJcbiAgICB2YXIgY2hlY2tPdXQgPSAkcm91dGVQYXJhbXMuY2hlY2tPdXQ7XHJcbiAgICB2YXIgcmF0ZUtleSA9ICRyb3V0ZVBhcmFtcy5yYXRlS2V5O1xyXG4gICAgdmFyIHJvb21UeXBlQ29kZSA9ICRyb3V0ZVBhcmFtcy5yb29tVHlwZUNvZGU7XHJcbiAgICB2YXIgcmF0ZUNvZGUgPSAkcm91dGVQYXJhbXMucmF0ZUNvZGU7XHJcbiAgICB2YXIgY2hhcmdlYWJsZVJhdGUgPSBlbmNvZGVVUklDb21wb25lbnQoJHJvdXRlUGFyYW1zLmNoYXJnZWFibGVSYXRlKTtcclxuXHJcbiAgICAkc2NvcGUuYm9va2luZyA9IHtcclxuICAgICAgICBmaXJzdE5hbWU6ICd0ZXN0JyxcclxuICAgICAgICBsYXN0TmFtZTogJ2Jvb2tpbmcnLFxyXG4gICAgICAgIGVtYWlsOiAnYm9nZGFuZG9yY2FAZ21haWwuY29tJyxcclxuICAgICAgICBwaG9uZTogJzAwNDA3NjMxOTE1NDMnLFxyXG4gICAgICAgIGNhcmROdW1iZXI6ICc1NDAxOTk5OTk5OTk5OTk5JyxcclxuICAgICAgICBjYXJkVHlwZTogJ0NBJyxcclxuICAgICAgICBjYXJkQ3Z2OiAnMTIzJyxcclxuICAgICAgICBjYXJkTW9udGg6ICcwNicsXHJcbiAgICAgICAgY2FyZFllYXI6ICcyMDE3JyxcclxuICAgICAgICBjYXJkRmlyc3ROYW1lOiAnVGVzdCcsXHJcbiAgICAgICAgY2FyZExhc3ROYW1lOiAnQm9va2luZycsXHJcbiAgICAgICAgYWRkcmVzczogJ3RyYXZlbG5vdycsXHJcbiAgICAgICAgY2l0eTogJ3RyYXZlbG5vdycsXHJcbiAgICAgICAgcHJvdmluY2U6ICcnLFxyXG4gICAgICAgIGNvdW50cnk6ICdSTycsXHJcbiAgICAgICAgcG9zdGFsQ29kZTogJzUxNTQwMCdcclxuICAgIH07XHJcbiAgICAkc2NvcGUuYm9vayA9IGZ1bmN0aW9uKGJvb2tpbmcpe1xyXG4gICAgICAgICRodHRwLnBvc3QoJy9hcGkvYm9vay8nK2hvdGVsSWQrJy8nK2NoZWNrSW4rJy8nK2NoZWNrT3V0KycvJytyYXRlS2V5KycvJytyb29tVHlwZUNvZGUrJy8nK3JhdGVDb2RlKycvJytjaGFyZ2VhYmxlUmF0ZSwge1xyXG4gICAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgICAgICBmaXJzdE5hbWU6ICRzY29wZS5ib29raW5nLmZpcnN0TmFtZSxcclxuICAgICAgICAgICAgICAgIGxhc3ROYW1lOiAkc2NvcGUuYm9va2luZy5sYXN0TmFtZSxcclxuICAgICAgICAgICAgICAgIGVtYWlsOiAkc2NvcGUuYm9va2luZy5lbWFpbCxcclxuICAgICAgICAgICAgICAgIHBob25lOiAkc2NvcGUuYm9va2luZy5waG9uZSxcclxuICAgICAgICAgICAgICAgIGNhcmROdW1iZXI6ICRzY29wZS5ib29raW5nLmNhcmROdW1iZXIsXHJcbiAgICAgICAgICAgICAgICBjYXJkVHlwZTogJHNjb3BlLmJvb2tpbmcuY2FyZFR5cGUsXHJcbiAgICAgICAgICAgICAgICBjYXJkQ3Z2OiAkc2NvcGUuYm9va2luZy5jYXJkQ3Z2LFxyXG4gICAgICAgICAgICAgICAgY2FyZE1vbnRoOiAkc2NvcGUuYm9va2luZy5jYXJkTW9udGgsXHJcbiAgICAgICAgICAgICAgICBjYXJkWWVhcjogJHNjb3BlLmJvb2tpbmcuY2FyZFllYXIsXHJcbiAgICAgICAgICAgICAgICBjYXJkRmlyc3ROYW1lOiAkc2NvcGUuYm9va2luZy5jYXJkRmlyc3ROYW1lLFxyXG4gICAgICAgICAgICAgICAgY2FyZExhc3ROYW1lOiAkc2NvcGUuYm9va2luZy5jYXJkTGFzdE5hbWUsXHJcbiAgICAgICAgICAgICAgICBhZGRyZXNzOiAkc2NvcGUuYm9va2luZy5hZGRyZXNzLFxyXG4gICAgICAgICAgICAgICAgY2l0eTogJHNjb3BlLmJvb2tpbmcuY2l0eSxcclxuICAgICAgICAgICAgICAgIHByb3ZpbmNlOiAkc2NvcGUuYm9va2luZy5wcm92aW5jZSxcclxuICAgICAgICAgICAgICAgIGNvdW50cnk6ICRzY29wZS5ib29raW5nLmNvdW50cnksXHJcbiAgICAgICAgICAgICAgICBwb3N0YWxDb2RlOiAkc2NvcGUuYm9va2luZy5wb3N0YWxDb2RlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICAgICAgICAuc3VjY2VzcyhmdW5jdGlvbihkYXRhKXtcclxuICAgICAgICAgICAgICAgIGRhdGEgPSBkYXRhLkhvdGVsUm9vbVJlc2VydmF0aW9uUmVzcG9uc2U7XHJcbiAgICAgICAgICAgICAgICB2YXIgaXRpbmVyYXJ5SWQgPSBkYXRhLml0aW5lcmFyeUlkO1xyXG4gICAgICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy9jb25maXJtYXRpb24vJytpdGluZXJhcnlJZCsnLycrJHNjb3BlLmJvb2tpbmcuZW1haWwpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZXJyb3IoZnVuY3Rpb24oZXJyKXtcclxuICAgICAgICAgICAgICAgIC8vIFRPRE86IGVycm9yIGNhdGNoXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfTtcclxufV0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb250cm9sbGVyKCdDb25maXJtYXRpb25DdHJsJywgWyckc2NvcGUnLCAnJGh0dHAnLCAnJHJvdXRlUGFyYW1zJywgZnVuY3Rpb24oJHNjb3BlLCAkaHR0cCwgJHJvdXRlUGFyYW1zKXtcclxuICAgIHZhciBpdGluZXJhcnlJZCA9ICRyb3V0ZVBhcmFtcy5pdGluZXJhcnlJZCxcclxuICAgICAgICBlbWFpbCA9ICRyb3V0ZVBhcmFtcy5lbWFpbDtcclxuICAgICRzY29wZS5oZWFkaW5nID0gaXRpbmVyYXJ5SWQ7XHJcbiAgICAkaHR0cC5nZXQoJy9hcGkvaXRpbmVyYXJ5LycraXRpbmVyYXJ5SWQrJy8nK2VtYWlsKVxyXG4gICAgICAgIC5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICAgICAgICBkYXRhID0gZGF0YS5Ib3RlbEl0aW5lcmFyeVJlc3BvbnNlO1xyXG4gICAgICAgICAgICAkc2NvcGUuaGVhZGluZyA9IGRhdGEuSXRpbmVyYXJ5Lml0aW5lcmFyeUlkO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmVycm9yKGZ1bmN0aW9uKGVycil7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XHJcbiAgICAgICAgfSk7XHJcbn1dKTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwJykuY29udHJvbGxlcignTGlzdEN0cmwnLCBbJyRzY29wZScsICckaHR0cCcsICckcm91dGVQYXJhbXMnLCAnJGxvY2F0aW9uJywgJ0hvdGVsTGlzdCcsICdFYW5JbWFnZScsIGZ1bmN0aW9uKCRzY29wZSwgJGh0dHAsICRyb3V0ZVBhcmFtcywgJGxvY2F0aW9uLCBIb3RlbExpc3QsIEVhbkltYWdlKXtcclxuICAgICRzY29wZS5ob3RlbExpc3QgPSBbXTtcclxuICAgICRzY29wZS50aXRsZSA9ICdTZWxlY3QgeW91ciBmYXZvcml0ZSBob3RlbCc7XHJcbiAgICAkc2NvcGUudHJhbnNsYXRlID0gZnVuY3Rpb24oaW1hZ2VVcmwpe1xyXG4gICAgICAgIHJldHVybiBFYW5JbWFnZS50cmFuc2xhdGUoaW1hZ2VVcmwsICd0JywgJ2wnKTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gUGFyYW1zXHJcbiAgICB2YXIgdHlwZSA9ICRyb3V0ZVBhcmFtcy50eXBlO1xyXG4gICAgdmFyIGRlc3RpbmF0aW9uSWQgPSAkcm91dGVQYXJhbXMuZGVzdGluYXRpb247XHJcbiAgICB2YXIgY2hlY2tJbiA9ICRyb3V0ZVBhcmFtcy5jaGVja0luO1xyXG4gICAgdmFyIGNoZWNrT3V0ID0gJHJvdXRlUGFyYW1zLmNoZWNrT3V0O1xyXG4gICAgSG90ZWxMaXN0LmdldEhvdGVsTGlzdCh0eXBlLCBkZXN0aW5hdGlvbklkLCBjaGVja0luLCBjaGVja091dCkudGhlbihmdW5jdGlvbihkYXRhKXtcclxuICAgICAgICBpZih0eXBlPT09J2hvdGVsJyl7XHJcbiAgICAgICAgICAgICRzY29wZS5ob3RlbFNlbGVjdChkYXRhLkhvdGVsTGlzdC5Ib3RlbFN1bW1hcnkuaG90ZWxJZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHJlbW92ZSB0aGUgbG9hZGVyXHJcbiAgICAgICAgaWYoZGF0YS5Ib3RlbExpc3QuSG90ZWxTdW1tYXJ5LmNvbnN0cnVjdG9yID09PSBBcnJheSl7XHJcbiAgICAgICAgICAgICRzY29wZS5ob3RlbExpc3QgPSBkYXRhLkhvdGVsTGlzdC5Ib3RlbFN1bW1hcnk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJHNjb3BlLmhvdGVsTGlzdC5wdXNoKGRhdGEuSG90ZWxMaXN0LkhvdGVsU3VtbWFyeSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBIb3RlbExpc3QuZ2V0RGVzdGluYXRpb25EZXRhaWxzKGRlc3RpbmF0aW9uSWQpLnRoZW4oZnVuY3Rpb24oZGF0YSl7XHJcbiAgICAgICAgJHNjb3BlLnRpdGxlID0gZGF0YS5OYW1lO1xyXG4gICAgfSk7XHJcbiAgICAkc2NvcGUuaG90ZWxTZWxlY3QgPSBmdW5jdGlvbihob3RlbElkKXtcclxuICAgICAgICAkbG9jYXRpb24ucGF0aCgnL2F2YWlsLycraG90ZWxJZCsnLycrY2hlY2tJbisnLycrY2hlY2tPdXQpO1xyXG4gICAgfTtcclxufV0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb250cm9sbGVyKCdTZWFyY2hDdHJsJywgWyckc2NvcGUnLCAnJGxvY2F0aW9uJywgJ1BvcHVsYXJEZXN0aW5hdGlvbnMnLCAnRGF0ZVBpY2tlcicsICdUb2FzdHInLCBmdW5jdGlvbigkc2NvcGUsICRsb2NhdGlvbiwgUG9wdWxhckRlc3RpbmF0aW9ucywgRGF0ZVBpY2tlciwgVG9hc3RyKXtcclxuICAgIC8vIENoZWNrLWluXHJcbiAgICAkc2NvcGUuY2lkdCA9IERhdGVQaWNrZXIubmV3RGF0ZSgxLCAwLCAwLCAnZGQvbW0veXl5eScpO1xyXG4gICAgJHNjb3BlLmNoZWNrSW5NaW5EYXRlID0gJHNjb3BlLmNoZWNrSW5NaW5EYXRlID8gbnVsbCA6IG5ldyBEYXRlKERhdGVQaWNrZXIubmV3RGF0ZSgxLCAwLCAwLCAnbW0vZGQveXl5eScpKTtcclxuICAgICRzY29wZS5jaGVja0luTWF4RGF0ZSA9IG5ldyBEYXRlKERhdGVQaWNrZXIubmV3RGF0ZSgxLCAzLCAwLCAnbW0vZGQveXl5eScpKTtcclxuXHJcbiAgICAkc2NvcGUuY29kdCA9IERhdGVQaWNrZXIubmV3RGF0ZSgzLCAwLCAwLCAnZGQvbW0veXl5eScpO1xyXG4gICAgJHNjb3BlLmNoZWNrT3V0TWluRGF0ZSA9ICRzY29wZS5jaGVja091dE1pbkRhdGUgPyBudWxsIDogbmV3IERhdGUoRGF0ZVBpY2tlci5uZXdEYXRlKDMsIDAsIDAsICdtbS9kZC95eXl5JykpO1xyXG4gICAgJHNjb3BlLmNoZWNrT3V0TWF4RGF0ZSA9IG5ldyBEYXRlKERhdGVQaWNrZXIubmV3RGF0ZSgyLCAzLCAwLCAnbW0vZGQveXl5eScpKTtcclxuXHJcblxyXG4gICAgJHNjb3BlLmNoZWNrSW5PcGVuZWQgPSBmYWxzZTtcclxuICAgICRzY29wZS5jaGVja091dE9wZW5lZCA9IGZhbHNlO1xyXG5cclxuICAgICRzY29wZS5kYXRlcGlja2VyT3BlbiA9IGZ1bmN0aW9uKCRldmVudCwgcGFuZWwpe1xyXG4gICAgICAgICRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAkc2NvcGUuY2hlY2tJbk9wZW5lZCA9IChwYW5lbCA9PT0gJ2NoZWNrSW4nKTtcclxuICAgICAgICAkc2NvcGUuY2hlY2tPdXRPcGVuZWQgPSAocGFuZWwgPT09ICdjaGVja091dCcpO1xyXG4gICAgfTtcclxuICAgICRzY29wZS5kYXRlT3B0aW9ucyA9IERhdGVQaWNrZXIuZGF0ZU9wdGlvbnM7XHJcbiAgICAkc2NvcGUuZm9ybWF0ID0gRGF0ZVBpY2tlci5mb3JtYXQ7XHJcblxyXG4gICAgLy8gUmVjb21tZW5kZWQgZGVzdGluYXRpb25zXHJcbiAgICAkc2NvcGUucG9wdWxhckRlc3RpbmF0aW9ucyA9IFtdO1xyXG4gICAgJHNjb3BlLnBvcHVsYXJEZXN0aW5hdGlvbnNMb2FkZXIgPSB0cnVlO1xyXG4gICAgLy8gRGVmYXVsdCBkYXRlcyB0byBzZWFyY2ggZm9yXHJcbiAgICAkc2NvcGUuZGVmYXVsdENoZWNrSW4gPSBEYXRlUGlja2VyLm5ld0RhdGUoMiwgMCwgMCwgJ2RkLW1tLXl5eXknKTtcclxuICAgICRzY29wZS5kZWZhdWx0Q2hlY2tPdXQgPSBEYXRlUGlja2VyLm5ld0RhdGUoNSwgMCwgMCwgJ2RkLW1tLXl5eXknKTtcclxuICAgIFBvcHVsYXJEZXN0aW5hdGlvbnMuZ2V0UG9wdWxhckRlc3RpbmF0aW9ucygpLnRoZW4oZnVuY3Rpb24oZGF0YSl7XHJcbiAgICAgICAgJHNjb3BlLnBvcHVsYXJEZXN0aW5hdGlvbnMgPSBkYXRhO1xyXG4gICAgICAgICRzY29wZS5wb3B1bGFyRGVzdGluYXRpb25zTG9hZGVyID0gZmFsc2U7XHJcbiAgICB9KTtcclxuXHJcblxyXG4gICAgLy8gRm9ybVxyXG4gICAgJHNjb3BlLnNlYXJjaEhvdGVscyA9IGZ1bmN0aW9uKGRlc3RpbmF0aW9uLCBjaGVja0luLCBjaGVja091dCl7XHJcbiAgICAgICAgLy8gVE9ETzogU2V0LXVwIHZhbGlkYXRpb25cclxuICAgICAgICBpZihkZXN0aW5hdGlvbiAmJiBkZXN0aW5hdGlvbi5UeXBlICYmIGRlc3RpbmF0aW9uLkRlc3RpbmF0aW9uSWQpe1xyXG4gICAgICAgICAgICBpZihjaGVja0luICYmIGNoZWNrT3V0ICl7XHJcbiAgICAgICAgICAgICAgICB0b2FzdHIuY2xlYXIoKTtcclxuICAgICAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvbGlzdC8nK2Rlc3RpbmF0aW9uLlR5cGUrJy8nK2Rlc3RpbmF0aW9uLkRlc3RpbmF0aW9uSWQrJy8nK0RhdGVQaWNrZXIucmVwbGFjZURhdGVTZXBhcmF0b3IoY2hlY2tJbikrJy8nK0RhdGVQaWNrZXIucmVwbGFjZURhdGVTZXBhcmF0b3IoY2hlY2tPdXQpKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIFRvYXN0ci5lcnJvclRvYXN0KCdUaGUgZGF0ZXMgc2VsZWN0ZWQgYXJlIGluY29ycmVjdC4nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIFRvYXN0ci5lcnJvclRvYXN0KCdUaGUgZGVzdGluYXRpb24gZW50ZXJlZCBpcyBpbmNvcnJlY3QuJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufV0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKS5mYWN0b3J5KCdEYXRlUGlja2VyJywgW2Z1bmN0aW9uKCl7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGZvcm1hdERhdGU6IGZ1bmN0aW9uKGRheSwgbW9udGgsIHllYXIsIGZvcm1hdCl7XHJcbiAgICAgICAgICAgIGlmKGZvcm1hdCA9PT0gJ2RkL21tL3l5eXknKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiAoZGF5LnRvU3RyaW5nKCkuZG1Gb3JtYXQoKSkrJy8nKyhtb250aC50b1N0cmluZygpLmRtRm9ybWF0KCkpKycvJyt5ZWFyO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYoZm9ybWF0ID09PSAnbW0vZGQveXl5eScpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIChtb250aC50b1N0cmluZygpLmRtRm9ybWF0KCkpKycvJysoZGF5LnRvU3RyaW5nKCkuZG1Gb3JtYXQoKSkrJy8nK3llYXI7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZihmb3JtYXQgPT09ICd5eXl5L21tL2RkJykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHllYXIgKyAnLycgKyAobW9udGgudG9TdHJpbmcoKS5kbUZvcm1hdCgpKSArICcvJyArIChkYXkudG9TdHJpbmcoKS5kbUZvcm1hdCgpKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmKGZvcm1hdCA9PT0gJ2RkLW1tLXl5eXknKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKGRheS50b1N0cmluZygpLmRtRm9ybWF0KCkpKyctJysobW9udGgudG9TdHJpbmcoKS5kbUZvcm1hdCgpKSsnLScreWVhcjtcclxuICAgICAgICAgICAgfSBlbHNlIGlmKGZvcm1hdCA9PT0gJ21tLWRkLXl5eXknKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKChtb250aC50b1N0cmluZygpLmRtRm9ybWF0KCkpKyctJytkYXkudG9TdHJpbmcoKS5kbUZvcm1hdCgpKSsnLScreWVhcjtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbmV3RGF0ZTogZnVuY3Rpb24oZGF5RGVsYXksIG1vbnRoRGVsYXksIHllYXJEZWxheSwgZm9ybWF0KXtcclxuICAgICAgICAgICAgdmFyIGRhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgICAgICBkYXRlLnNldERhdGUoZGF0ZS5nZXREYXRlKCkgKyBkYXlEZWxheSk7XHJcblxyXG4gICAgICAgICAgICB2YXIgZGF5ID0gZGF0ZS5nZXREYXRlKCkudG9TdHJpbmcoKS5kbUZvcm1hdCgpO1xyXG4gICAgICAgICAgICB2YXIgbW9udGggPSAoZGF0ZS5nZXRNb250aCgpICsgMSArIG1vbnRoRGVsYXkpLnRvU3RyaW5nKCkuZG1Gb3JtYXQoKTtcclxuICAgICAgICAgICAgdmFyIHllYXIgPSBkYXRlLmdldEZ1bGxZZWFyKCkgKyB5ZWFyRGVsYXk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5mb3JtYXREYXRlKGRheSwgbW9udGgsIHllYXIsIGZvcm1hdCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXBsYWNlRGF0ZVNlcGFyYXRvcjogZnVuY3Rpb24ob2xkRGF0ZSl7XHJcbiAgICAgICAgICAgIGlmKG9sZERhdGUuY29uc3RydWN0b3IgIT09IFN0cmluZyl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5mb3JtYXREYXRlKG9sZERhdGUuZ2V0RGF0ZSgpLCAob2xkRGF0ZS5nZXRNb250aCgpKzEpLCBvbGREYXRlLmdldEZ1bGxZZWFyKCksICdkZC1tbS15eXl5Jyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb2xkRGF0ZS5yZXBsYWNlKCcvJywgJy0nKS5yZXBsYWNlKCcvJywgJy0nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGF0ZU9wdGlvbnM6IHtcclxuICAgICAgICAgICAgZm9ybWF0WWVhcjogJ3l5JyxcclxuICAgICAgICAgICAgc3RhcnRpbmdEYXk6IDFcclxuICAgICAgICB9LFxyXG4gICAgICAgIGZvcm1hdHM6IFsnZGQvTU0veXl5eScsICd5eXl5L01NL2RkJywgJ2RkL01NL3l5eXknLCAnc2hvcnREYXRlJ10sXHJcbiAgICAgICAgZm9ybWF0OiAnZGQvTU0veXl5eSdcclxuICAgIH07XHJcbn1dKTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwJykuZmFjdG9yeSgnSG90ZWxMaXN0JywgWyckaHR0cCcsICckcScsIGZ1bmN0aW9uKCRodHRwLCAkcSl7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGdldEhvdGVsTGlzdDogZnVuY3Rpb24odHlwZSwgZGVzdGluYXRpb25JZCwgY2hlY2tJbiwgY2hlY2tPdXQpe1xyXG4gICAgICAgICAgICB2YXIgZGVmZXIgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICAkaHR0cC5nZXQoJy9hcGkvbGlzdC8nK3R5cGUrJy8nK2Rlc3RpbmF0aW9uSWQrJy8nK2NoZWNrSW4rJy8nK2NoZWNrT3V0KycvMicpXHJcbiAgICAgICAgICAgICAgICAuc3VjY2VzcyhmdW5jdGlvbihkYXRhKXtcclxuICAgICAgICAgICAgICAgICAgICBpZihkYXRhLmxlbmd0aCAhPT0gMCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVyLnJlc29sdmUoZGF0YS5Ib3RlbExpc3RSZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlci5wcm9taXNlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0RGVzdGluYXRpb25EZXRhaWxzOiBmdW5jdGlvbihkZXN0aW5hdGlvbklkKXtcclxuICAgICAgICAgICAgdmFyIGRlZmVyID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgJGh0dHAuZ2V0KCcvYXBpL2Rlc3RpbmF0aW9uL2RldGFpbHMvJytkZXN0aW5hdGlvbklkKVxyXG4gICAgICAgICAgICAgICAgLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSl7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXIucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuZXJyb3IoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlci5yZXNvbHZlKCdTZWxlY3QgeW91ciBmYXZvcml0ZSBob3RlbCcpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlci5wcm9taXNlO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn1dKTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwJykuZmFjdG9yeSgnRWFuSW1hZ2UnLCBbZnVuY3Rpb24oKXtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgdHJhbnNsYXRlOiBmdW5jdGlvbihpbWFnZSwgZnJvbSwgdG8pe1xyXG4gICAgICAgICAgICByZXR1cm4gaW1hZ2UucmVwbGFjZSgnXycrZnJvbSsnLmpwZycsICdfJyt0bysnLmpwZycpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG59XSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmZhY3RvcnkoJ1BvcHVsYXJEZXN0aW5hdGlvbnMnLCBbJyRodHRwJywgJyRxJywgZnVuY3Rpb24oJGh0dHAsICRxKXtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgZ2V0UG9wdWxhckRlc3RpbmF0aW9uczogZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgJGh0dHAuZ2V0KCcvYXBpL3BvcHVsYXIvNycpXHJcbiAgICAgICAgICAgICAgICAuc3VjY2VzcyhmdW5jdGlvbihkYXRhKXtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW5kZW50U2VsZWN0aW9uOiBmdW5jdGlvbihkZXN0aW5hdGlvbklkKXtcclxuICAgICAgICAgICAgJGh0dHAucG9zdCgnL2FwaS9wb3B1bGFyLycrZGVzdGluYXRpb25JZCwge30pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn1dKTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwJykuZmFjdG9yeSgnVG9hc3RyJywgW2Z1bmN0aW9uKCl7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3NUb2FzdDogZnVuY3Rpb24obWVzc2FnZSl7XHJcbiAgICAgICAgICAgIHRvYXN0ci5vcHRpb25zLmNsb3NlQnV0dG9uID0gdHJ1ZTtcclxuICAgICAgICAgICAgdG9hc3RyLm9wdGlvbnMucHJldmVudER1cGxpY2F0ZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICB0b2FzdHIuc3VjY2VzcyhtZXNzYWdlKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVycm9yVG9hc3Q6IGZ1bmN0aW9uKG1lc3NhZ2Upe1xyXG4gICAgICAgICAgICB0b2FzdHIub3B0aW9ucy5jbG9zZUJ1dHRvbiA9IHRydWU7XHJcbiAgICAgICAgICAgIHRvYXN0ci5vcHRpb25zLnByZXZlbnREdXBsaWNhdGVzID0gdHJ1ZTtcclxuICAgICAgICAgICAgdG9hc3RyLmVycm9yKG1lc3NhZ2UpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn1dKTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwJykuZmFjdG9yeSgnVmFsdWVBZGRzJywgW2Z1bmN0aW9uKCl7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGdlbmVyYXRlSWNvbjogZnVuY3Rpb24odmFsdWVBZGQpe1xyXG4gICAgICAgICAgICBpZih2YWx1ZUFkZCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsdWVBZGQuaW5kZXhPZignQnJlYWtmYXN0JykgPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnPGkgY2xhc3M9XCJmYSBmYS1jdXRsZXJ5XCI+PC9pPiAnICsgdmFsdWVBZGQ7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlQWRkLmluZGV4T2YoJ1dpcmVsZXNzJykgPiAtMSB8fCB2YWx1ZUFkZC5pbmRleE9mKCdJbnRlcm5ldCcpID4gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJzxpIGNsYXNzPVwiZmEgZmEtd2lmaVwiPjwvaT4gJyArIHZhbHVlQWRkO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZUFkZC5pbmRleE9mKCdQYXJraW5nJykgPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnPGkgY2xhc3M9XCJmYSBmYS1jYXJcIj48L2k+ICcgKyB2YWx1ZUFkZDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICc8aSBjbGFzcz1cImZhIGZhLW1vbmV5XCI+PC9pPiAnICsgdmFsdWVBZGQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59XSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmZpbHRlcigndW5zYWZlJywgWyckc2NlJywgZnVuY3Rpb24oJHNjZSkgeyByZXR1cm4gJHNjZS50cnVzdEFzSHRtbDsgfV0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKS5kaXJlY3RpdmUoJ25nQXV0b2NvbXBsZXRlJywgWyckZG9jdW1lbnQnLCAnJGh0dHAnLCAnUG9wdWxhckRlc3RpbmF0aW9ucycsIGZ1bmN0aW9uKCRkb2N1bWVudCwgJGh0dHAsIFBvcHVsYXJEZXN0aW5hdGlvbnMpe1xyXG4gICAgdmFyIGxpbmtlciA9IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50KXtcclxuICAgICAgICAkZG9jdW1lbnQuY2xpY2soZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgc2NvcGUuJGFwcGx5KHNjb3BlLmhpZGVBdXRvY29tcGxldGUgPSB0cnVlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBlbGVtZW50LmNsaWNrKGZ1bmN0aW9uKGV2ZW50KXtcclxuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgdmFyIGNvbnRyb2xsZXIgPSBmdW5jdGlvbigkc2NvcGUpe1xyXG4gICAgICAgICRzY29wZS5hdXRvY29tcGxldGVMaXN0ID0ge1xyXG4gICAgICAgICAgICBjaXRpZXM6IFtdLFxyXG4gICAgICAgICAgICBob3RlbHM6IFtdLFxyXG4gICAgICAgICAgICBhaXJwb3J0czogW11cclxuICAgICAgICB9O1xyXG4gICAgICAgIHZhciByZXNldEF1dG9jb21wbGV0ZSA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICRzY29wZS5hdXRvY29tcGxldGVMaXN0ID0ge1xyXG4gICAgICAgICAgICAgICAgY2l0aWVzOiBbXSxcclxuICAgICAgICAgICAgICAgIGhvdGVsczogW10sXHJcbiAgICAgICAgICAgICAgICBhaXJwb3J0czogW11cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBHZXQgYXV0b2NvbXBsZXRlIGxpc3RcclxuICAgICAgICAkc2NvcGUuYXV0b2NvbXBsZXRlID0gZnVuY3Rpb24oZGVzdGluYXRpb24pe1xyXG4gICAgICAgICAgICBpZihkZXN0aW5hdGlvbi5sZW5ndGggPiAyKXtcclxuICAgICAgICAgICAgICAgICRodHRwLmdldCgnL2FwaS9hdXRvY29tcGxldGUvJytkZXN0aW5hdGlvbilcclxuICAgICAgICAgICAgICAgICAgICAuc3VjY2VzcyhmdW5jdGlvbihkYXRhKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzZXRBdXRvY29tcGxldGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBpPTA7aTxkYXRhLmxlbmd0aDtpKyspe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoZGF0YVtpXS5UeXBlID09PSAnY2l0eScpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5hdXRvY29tcGxldGVMaXN0LmNpdGllcy5wdXNoKGRhdGFbaV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmKGRhdGFbaV0uVHlwZSA9PT0gJ2hvdGVsJyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmF1dG9jb21wbGV0ZUxpc3QuaG90ZWxzLnB1c2goZGF0YVtpXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYoZGF0YVtpXS5UeXBlID09PSAnYWlycG9ydCcpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5hdXRvY29tcGxldGVMaXN0LmFpcnBvcnRzLnB1c2goZGF0YVtpXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuaGlkZUF1dG9jb21wbGV0ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXNldEF1dG9jb21wbGV0ZSgpO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmhpZGVBdXRvY29tcGxldGUgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gQ2F0ZWdvcnkgaGlkZVxyXG4gICAgICAgICRzY29wZS5jaXRpZXNBcnJheUlzRW1wdHkgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICByZXR1cm4gKCRzY29wZS5hdXRvY29tcGxldGVMaXN0LmNpdGllcy5sZW5ndGggPT09IDApO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgJHNjb3BlLmhvdGVsc0FycmF5SXNFbXB0eSA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHJldHVybiAoJHNjb3BlLmF1dG9jb21wbGV0ZUxpc3QuaG90ZWxzLmxlbmd0aCA9PT0gMCk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICAkc2NvcGUuYWlycG9ydHNBcnJheUlzRW1wdHkgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICByZXR1cm4gKCRzY29wZS5hdXRvY29tcGxldGVMaXN0LmFpcnBvcnRzLmxlbmd0aCA9PT0gMCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gQXV0b2NvbXBsZXRlIGhpZGVcclxuICAgICAgICAkc2NvcGUuaGlkZUF1dG9jb21wbGV0ZSA9IHRydWU7XHJcbiAgICAgICAgdmFyIGF1dG9jb21wbGV0ZUxpc3RJc0VtcHR5ID0gZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgcmV0dXJuICgkc2NvcGUuYXV0b2NvbXBsZXRlTGlzdC5jaXRpZXMubGVuZ3RoID09PSAwICYmICRzY29wZS5hdXRvY29tcGxldGVMaXN0LmhvdGVscy5sZW5ndGggPT09IDAgJiYgJHNjb3BlLmF1dG9jb21wbGV0ZUxpc3QuYWlycG9ydHMubGVuZ3RoID09PSAwKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgICRzY29wZS5hdXRvY29tcGxldGVJc0hpZGRlbiA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHJldHVybiAoYXV0b2NvbXBsZXRlTGlzdElzRW1wdHkoKSB8fCAkc2NvcGUuaGlkZUF1dG9jb21wbGV0ZSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gQXV0b2NvbXBsZXRlIHNlbGVjdFxyXG4gICAgICAgICRzY29wZS5zZWxlY3REZXN0aW5hdGlvbiA9IGZ1bmN0aW9uKGl0ZW0sIHR5cGUpe1xyXG4gICAgICAgICAgICAkc2NvcGUuZGVzdGluYXRpb24gPSBpdGVtLk5hbWU7XHJcbiAgICAgICAgICAgICRzY29wZS5zZWxlY3RlZERlc3RpbmF0aW9uID0gaXRlbTtcclxuICAgICAgICAgICAgUG9wdWxhckRlc3RpbmF0aW9ucy5pbmRlbnRTZWxlY3Rpb24oaXRlbS5EZXN0aW5hdGlvbklkKTtcclxuICAgICAgICAgICAgcmVzZXRBdXRvY29tcGxldGUoKTtcclxuICAgICAgICB9O1xyXG4gICAgfTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgICAgICBsaW5rOiBsaW5rZXIsXHJcbiAgICAgICAgY29udHJvbGxlcjogY29udHJvbGxlcixcclxuICAgICAgICB0ZW1wbGF0ZVVybDogJy4vcGFydGlhbHMvaW5kZXgvYXV0b2NvbXBsZXRlJ1xyXG4gICAgfTtcclxufV0pOyIsIlN0cmluZy5wcm90b3R5cGUuZG1Gb3JtYXQgPSBmdW5jdGlvbigpe1xyXG4gICAgaWYodGhpcy5sZW5ndGggPT09IDEpe1xyXG4gICAgICAgIHJldHVybiAnMCcrdGhpcztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbn07Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9