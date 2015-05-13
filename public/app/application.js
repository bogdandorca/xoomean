String.prototype.dmFormat = function(){
    if(this.length === 1){
        return '0'+this;
    } else {
        return this;
    }
};
String.prototype.decodeHtmlEntity = function(){
    var ta = document.createElement('textarea');
    ta.innerHTML = this;
    return ta.value;
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
angular.module('app').controller('AvailCtrl', ['$scope', '$routeParams', '$http', '$location', 'ValueAdds', 'EanImage', '$timeout', '$sanitize', function($scope, $routeParams, $http, $location, ValueAdds, EanImage, $timeout, $sanitize){
    var hotelId = $routeParams.hotelId;
    var checkIn = $routeParams.checkIn;
    var checkOut = $routeParams.checkOut;

    $scope.rooms = [];
    $scope.hotelName = '';
    $scope.hotelAddress = '';
    $scope.hotelLocation = '';
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
    $scope.propertyAmenities = [];
    $scope.starRating = 0;
    $http.get('/api/hotel/information/'+hotelId)
        .success(function(data){
            console.log(data);
            data = data.HotelInformationResponse;
            $scope.hotelImages = data.HotelImages.HotelImage;
            $scope.selectedHotelImage = $scope.hotelImages[0].url;
            $scope.hotelAddress = data.HotelSummary.address1 + ', ' + data.HotelSummary.city;
            $scope.hotelLocation = data.HotelSummary.locationDescription;
            $scope.propertyDescription = data.HotelDetails.propertyDescription.decodeHtmlEntity();
            $scope.amenitiesDescription = data.HotelDetails.amenitiesDescription.decodeHtmlEntity();
            $scope.areaInfo = data.HotelDetails.areaInformation.decodeHtmlEntity();
            // Important to be displayed
            $scope.knowBeforeYouGo = data.HotelDetails.knowBeforeYouGoDescription ? data.HotelDetails.knowBeforeYouGoDescription.decodeHtmlEntity() : '';
            $scope.checkInInstructions = data.HotelDetails.checkInInstructions.decodeHtmlEntity();
            $scope.hotelPolicy = data.HotelDetails.hotelPolicy.decodeHtmlEntity();
            $scope.propertInformation = data.HotelDetails.propertyInformation.decodeHtmlEntity();

            $scope.map.setCoordinates(data.HotelSummary.latitude, data.HotelSummary.longitude);
            $scope.propertyAmenities = data.PropertyAmenities.PropertyAmenity;
            // TODO: Set hotelRating
            $scope.starRating = data.HotelSummary.hotelRating;
            $scope.tripAdvisor = data.HotelSummary.tripAdvisorRatingUrl;
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
angular.module('app').filter('unsafe', ['$sce', function($sce) {
    return function(encodedText){
        return $sce.trustAsHtml(encodedText);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFpcnBsYW5lcy5qcyIsImFwcC5qcyIsImRpcmVjdGl2ZXMvc3RhclJhdGluZy5qcyIsImNvbnRyb2xsZXJzL2F2YWlsQ29udHJvbGxlci5qcyIsImNvbnRyb2xsZXJzL2Jvb2tDb250cm9sbGVyLmpzIiwiY29udHJvbGxlcnMvY29uZmlybWF0aW9uQ29udHJvbGxlci5qcyIsImNvbnRyb2xsZXJzL2xpc3RDb250cm9sbGVyLmpzIiwiY29udHJvbGxlcnMvc2VhcmNoQ29udHJvbGxlci5qcyIsInNlcnZpY2VzL2RhdGVwaWNrZXJTZXJ2aWNlLmpzIiwic2VydmljZXMvaG90ZWxMaXN0U2VydmljZS5qcyIsInNlcnZpY2VzL2ltYWdlU2VydmljZS5qcyIsInNlcnZpY2VzL3BvcHVsYXJEZXN0aW5hdGlvbnMuanMiLCJzZXJ2aWNlcy90b2FzdHJTZXJ2aWNlLmpzIiwic2VydmljZXMvdmFsdWVBZGRzU2VydmljZS5qcyIsImZpbHRlcnMvaGVscGVycy5qcyIsImRpcmVjdGl2ZXMvYXV0b2NvbXBsZXRlL2F1dG9jb21wbGV0ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHBsaWNhdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIlN0cmluZy5wcm90b3R5cGUuZG1Gb3JtYXQgPSBmdW5jdGlvbigpe1xyXG4gICAgaWYodGhpcy5sZW5ndGggPT09IDEpe1xyXG4gICAgICAgIHJldHVybiAnMCcrdGhpcztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbn07XHJcblN0cmluZy5wcm90b3R5cGUuZGVjb2RlSHRtbEVudGl0eSA9IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgdGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZXh0YXJlYScpO1xyXG4gICAgdGEuaW5uZXJIVE1MID0gdGhpcztcclxuICAgIHJldHVybiB0YS52YWx1ZTtcclxufTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwJywgWyduZ1JvdXRlJywgJ3VpLmJvb3RzdHJhcCcsICduZ0FuaW1hdGUnLCAndWlHbWFwZ29vZ2xlLW1hcHMnLCAnbmdTYW5pdGl6ZSddKS5jb25maWcoWyckcm91dGVQcm92aWRlcicsICckbG9jYXRpb25Qcm92aWRlcicsIGZ1bmN0aW9uKCRyb3V0ZVByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlcil7XHJcbiAgICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUodHJ1ZSk7XHJcbiAgICAkcm91dGVQcm92aWRlclxyXG4gICAgICAgIC53aGVuKCcvJywge1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9wYXJ0aWFscy9pbmRleC9zZWFyY2gnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnU2VhcmNoQ3RybCdcclxuICAgICAgICB9KVxyXG4gICAgICAgIC53aGVuKCcvbGlzdC86dHlwZS86ZGVzdGluYXRpb24vOmNoZWNrSW4vOmNoZWNrT3V0Jywge1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9wYXJ0aWFscy9saXN0L2xpc3QnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnTGlzdEN0cmwnXHJcbiAgICAgICAgfSlcclxuICAgICAgICAud2hlbignL2F2YWlsLzpob3RlbElkLzpjaGVja0luLzpjaGVja091dCcsIHtcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvcGFydGlhbHMvYXZhaWwvYXZhaWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnQXZhaWxDdHJsJ1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLndoZW4oJy9ib29rLzpob3RlbElkLzpjaGVja0luLzpjaGVja091dC86cmF0ZUtleS86cm9vbVR5cGVDb2RlLzpyYXRlQ29kZS86Y2hhcmdlYWJsZVJhdGUnLCB7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAncGFydGlhbHMvYm9vay9ib29rJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0Jvb2tDdHJsJ1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLndoZW4oJy9jb25maXJtYXRpb24vOml0aW5lcmFyeUlkLzplbWFpbCcsIHtcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdwYXJ0aWFscy9jb25maXJtYXRpb24vY29uZmlybWF0aW9uJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0NvbmZpcm1hdGlvbkN0cmwnXHJcbiAgICAgICAgfSlcclxuICAgICAgICAub3RoZXJ3aXNlKHtcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdwYXJ0aWFscy80MDQnXHJcbiAgICAgICAgfSk7XHJcbn1dKTtcclxuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmRpcmVjdGl2ZSgnbmdTdGFyUmF0aW5nJywgW2Z1bmN0aW9uKCl7XHJcbiAgICB2YXIgbGlua2VyID0gZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHIpe1xyXG4gICAgICAgIHNjb3BlLm51bWJlck9mU3RhcnMgPSBhdHRyLnN0YXJzO1xyXG4gICAgfTtcclxuICAgIHZhciBnZXRUZW1wbGF0ZSA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdmFyIHRlbXBsYXRlU3RydWN0dXJlID0gJzxkaXYgY2xhc3M9XCJzdGFyc1wiPic7XHJcbiAgICAgICAgdGVtcGxhdGVTdHJ1Y3R1cmUgKz0gJzxzcGFuIG5nLXNob3c9XCIobnVtYmVyT2ZTdGFycyA+PSAxKSB8fCBudW1iZXJPZlN0YXJzID09IDAuNVwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxpIGNsYXNzPVwiZmFcIiBuZy1jbGFzcz1cIm51bWJlck9mU3RhcnMgPT0gMC41ID8gXFwnZmEtc3Rhci1oYWxmXFwnIDogXFwnZmEtc3RhclxcJ1wiPjwvaT4nICtcclxuICAgICAgICAgICAgJzwvc3Bhbj4nO1xyXG4gICAgICAgIHRlbXBsYXRlU3RydWN0dXJlICs9ICc8c3BhbiBuZy1zaG93PVwiKG51bWJlck9mU3RhcnMgPj0gMikgfHwgbnVtYmVyT2ZTdGFycyA9PSAxLjVcIj4nICtcclxuICAgICAgICAgICAgJzxpIGNsYXNzPVwiZmFcIiBuZy1jbGFzcz1cIm51bWJlck9mU3RhcnMgPT0gMS41ID8gXFwnZmEtc3Rhci1oYWxmXFwnIDogXFwnZmEtc3RhclxcJ1wiPjwvaT4nICtcclxuICAgICAgICAgICAgJzwvc3Bhbj4nO1xyXG4gICAgICAgIHRlbXBsYXRlU3RydWN0dXJlICs9ICc8c3BhbiBuZy1zaG93PVwiKG51bWJlck9mU3RhcnMgPj0gMykgfHwgbnVtYmVyT2ZTdGFycyA9PSAyLjVcIj4nICtcclxuICAgICAgICAgICAgJzxpIGNsYXNzPVwiZmFcIiBuZy1jbGFzcz1cIm51bWJlck9mU3RhcnMgPT0gMi41ID8gXFwnZmEtc3Rhci1oYWxmXFwnIDogXFwnZmEtc3RhclxcJ1wiPjwvaT4nICtcclxuICAgICAgICAgICAgJzwvc3Bhbj4nO1xyXG4gICAgICAgIHRlbXBsYXRlU3RydWN0dXJlICs9ICc8c3BhbiBuZy1zaG93PVwiKG51bWJlck9mU3RhcnMgPj0gNCkgfHwgbnVtYmVyT2ZTdGFycyA9PSAzLjVcIj4nICtcclxuICAgICAgICAgICAgJzxpIGNsYXNzPVwiZmFcIiBuZy1jbGFzcz1cIm51bWJlck9mU3RhcnMgPT0gMy41ID8gXFwnZmEtc3Rhci1oYWxmXFwnIDogXFwnZmEtc3RhclxcJ1wiPjwvaT4nICtcclxuICAgICAgICAgICAgJzwvc3Bhbj4nO1xyXG4gICAgICAgIHRlbXBsYXRlU3RydWN0dXJlICs9ICc8c3BhbiBuZy1zaG93PVwiKG51bWJlck9mU3RhcnMgPj0gNSkgfHwgbnVtYmVyT2ZTdGFycyA9PSA0LjVcIj4nICtcclxuICAgICAgICAgICAgJzxpIGNsYXNzPVwiZmFcIiBuZy1jbGFzcz1cIm51bWJlck9mU3RhcnMgPT0gNC41ID8gXFwnZmEtc3Rhci1oYWxmXFwnIDogXFwnZmEtc3RhclxcJ1wiPjwvaT4nICtcclxuICAgICAgICAgICAgJzwvc3Bhbj4nO1xyXG4gICAgICAgIHRlbXBsYXRlU3RydWN0dXJlICs9ICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICByZXR1cm4gdGVtcGxhdGVTdHJ1Y3R1cmU7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgIHRlbXBsYXRlOiBnZXRUZW1wbGF0ZSgpLFxyXG4gICAgICAgIGxpbms6IGxpbmtlclxyXG4gICAgfTtcclxufV0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb250cm9sbGVyKCdBdmFpbEN0cmwnLCBbJyRzY29wZScsICckcm91dGVQYXJhbXMnLCAnJGh0dHAnLCAnJGxvY2F0aW9uJywgJ1ZhbHVlQWRkcycsICdFYW5JbWFnZScsICckdGltZW91dCcsICckc2FuaXRpemUnLCBmdW5jdGlvbigkc2NvcGUsICRyb3V0ZVBhcmFtcywgJGh0dHAsICRsb2NhdGlvbiwgVmFsdWVBZGRzLCBFYW5JbWFnZSwgJHRpbWVvdXQsICRzYW5pdGl6ZSl7XG4gICAgdmFyIGhvdGVsSWQgPSAkcm91dGVQYXJhbXMuaG90ZWxJZDtcbiAgICB2YXIgY2hlY2tJbiA9ICRyb3V0ZVBhcmFtcy5jaGVja0luO1xuICAgIHZhciBjaGVja091dCA9ICRyb3V0ZVBhcmFtcy5jaGVja091dDtcblxuICAgICRzY29wZS5yb29tcyA9IFtdO1xuICAgICRzY29wZS5ob3RlbE5hbWUgPSAnJztcbiAgICAkc2NvcGUuaG90ZWxBZGRyZXNzID0gJyc7XG4gICAgJHNjb3BlLmhvdGVsTG9jYXRpb24gPSAnJztcbiAgICAkc2NvcGUuY2hlY2tJbkluc3RydWN0aW9ucyA9ICcnO1xuICAgICRzY29wZS52YWx1ZUFkZHMgPSBbXTtcbiAgICAkc2NvcGUudHJhbnNsYXRlID0gZnVuY3Rpb24oaW1hZ2VVcmwsIGZyb20sIHRvKXtcbiAgICAgICAgcmV0dXJuIEVhbkltYWdlLnRyYW5zbGF0ZShpbWFnZVVybCwgZnJvbSwgdG8pO1xuICAgIH07XG4gICAgJHNjb3BlLm1hcCA9IHtcbiAgICAgICAgc2hvdzogZmFsc2UsXG4gICAgICAgIHJlZnJlc2g6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAkc2NvcGUubWFwLnNob3cgPSBmYWxzZTtcbiAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUubWFwLnNob3cgPSB0cnVlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNlbnRlcjoge1xuICAgICAgICAgICAgbGF0aXR1ZGU6IDAsXG4gICAgICAgICAgICBsb25naXR1ZGU6IDBcbiAgICAgICAgfSxcbiAgICAgICAgem9vbTogMTIsXG4gICAgICAgIG1hcmtlcjoge1xuICAgICAgICAgICAgaWQ6IDEsXG4gICAgICAgICAgICBjb29yZHM6IHtcbiAgICAgICAgICAgICAgICBsYXRpdHVkZTogMCxcbiAgICAgICAgICAgICAgICBsb25naXR1ZGU6IDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzaG93V2luZG93OiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIHNldENvb3JkaW5hdGVzOiBmdW5jdGlvbihsYXQsIGxvbmcpe1xuICAgICAgICAgICAgdGhpcy5jZW50ZXIubGF0aXR1ZGUgPSBsYXQ7XG4gICAgICAgICAgICB0aGlzLmNlbnRlci5sb25naXR1ZGUgPSBsb25nO1xuICAgICAgICAgICAgdGhpcy5tYXJrZXIuY29vcmRzLmxhdGl0dWRlID0gbGF0O1xuICAgICAgICAgICAgdGhpcy5tYXJrZXIuY29vcmRzLmxvbmdpdHVkZSA9IGxvbmc7XG4gICAgICAgIH1cbiAgICB9O1xuICAgICRodHRwLmdldCgnL2FwaS9hdmFpbC8nK2hvdGVsSWQrJy8nK2NoZWNrSW4rJy8nK2NoZWNrT3V0KVxuICAgICAgICAuc3VjY2VzcyhmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuICAgICAgICAgICAgZGF0YSA9IGRhdGEuSG90ZWxSb29tQXZhaWxhYmlsaXR5UmVzcG9uc2U7XG4gICAgICAgICAgICBpZihkYXRhWydAc2l6ZSddID4gMCl7XG4gICAgICAgICAgICAgICAgaWYoZGF0YS5Ib3RlbFJvb21SZXNwb25zZS5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpe1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUucm9vbXMgPSBkYXRhLkhvdGVsUm9vbVJlc3BvbnNlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5yb29tcy5wdXNoKGRhdGEuSG90ZWxSb29tUmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAkc2NvcGUuaG90ZWxOYW1lID0gZGF0YS5ob3RlbE5hbWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFsZXJ0KCdUaGVyZSBhcmUgbm8gcm9vbXMgYXZhaWxhYmxlIGZvciB0aGlzIGhvdGVsIGF2YWlsYWJsZScpO1xuICAgICAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgJHNjb3BlLmhvdGVsSW1hZ2VzID0gW107XG4gICAgJHNjb3BlLnNlbGVjdGVkSG90ZWxJbWFnZSA9ICcnO1xuICAgICRzY29wZS5hY3RpdmVJbWFnZSA9IDA7XG4gICAgJHNjb3BlLmNoYW5nZUhvdGVsSW1hZ2UgPSBmdW5jdGlvbihpbWFnZUluZGV4KXtcbiAgICAgICAgJHNjb3BlLnNlbGVjdGVkSG90ZWxJbWFnZSA9ICRzY29wZS5ob3RlbEltYWdlc1tpbWFnZUluZGV4XS51cmw7XG4gICAgICAgICRzY29wZS5hY3RpdmVJbWFnZSA9IGltYWdlSW5kZXg7XG4gICAgfTtcbiAgICAkc2NvcGUucHJvcGVydHlBbWVuaXRpZXMgPSBbXTtcbiAgICAkc2NvcGUuc3RhclJhdGluZyA9IDA7XG4gICAgJGh0dHAuZ2V0KCcvYXBpL2hvdGVsL2luZm9ybWF0aW9uLycraG90ZWxJZClcbiAgICAgICAgLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcbiAgICAgICAgICAgIGRhdGEgPSBkYXRhLkhvdGVsSW5mb3JtYXRpb25SZXNwb25zZTtcbiAgICAgICAgICAgICRzY29wZS5ob3RlbEltYWdlcyA9IGRhdGEuSG90ZWxJbWFnZXMuSG90ZWxJbWFnZTtcbiAgICAgICAgICAgICRzY29wZS5zZWxlY3RlZEhvdGVsSW1hZ2UgPSAkc2NvcGUuaG90ZWxJbWFnZXNbMF0udXJsO1xuICAgICAgICAgICAgJHNjb3BlLmhvdGVsQWRkcmVzcyA9IGRhdGEuSG90ZWxTdW1tYXJ5LmFkZHJlc3MxICsgJywgJyArIGRhdGEuSG90ZWxTdW1tYXJ5LmNpdHk7XG4gICAgICAgICAgICAkc2NvcGUuaG90ZWxMb2NhdGlvbiA9IGRhdGEuSG90ZWxTdW1tYXJ5LmxvY2F0aW9uRGVzY3JpcHRpb247XG4gICAgICAgICAgICAkc2NvcGUucHJvcGVydHlEZXNjcmlwdGlvbiA9IGRhdGEuSG90ZWxEZXRhaWxzLnByb3BlcnR5RGVzY3JpcHRpb24uZGVjb2RlSHRtbEVudGl0eSgpO1xuICAgICAgICAgICAgJHNjb3BlLmFtZW5pdGllc0Rlc2NyaXB0aW9uID0gZGF0YS5Ib3RlbERldGFpbHMuYW1lbml0aWVzRGVzY3JpcHRpb24uZGVjb2RlSHRtbEVudGl0eSgpO1xuICAgICAgICAgICAgJHNjb3BlLmFyZWFJbmZvID0gZGF0YS5Ib3RlbERldGFpbHMuYXJlYUluZm9ybWF0aW9uLmRlY29kZUh0bWxFbnRpdHkoKTtcbiAgICAgICAgICAgIC8vIEltcG9ydGFudCB0byBiZSBkaXNwbGF5ZWRcbiAgICAgICAgICAgICRzY29wZS5rbm93QmVmb3JlWW91R28gPSBkYXRhLkhvdGVsRGV0YWlscy5rbm93QmVmb3JlWW91R29EZXNjcmlwdGlvbiA/IGRhdGEuSG90ZWxEZXRhaWxzLmtub3dCZWZvcmVZb3VHb0Rlc2NyaXB0aW9uLmRlY29kZUh0bWxFbnRpdHkoKSA6ICcnO1xuICAgICAgICAgICAgJHNjb3BlLmNoZWNrSW5JbnN0cnVjdGlvbnMgPSBkYXRhLkhvdGVsRGV0YWlscy5jaGVja0luSW5zdHJ1Y3Rpb25zLmRlY29kZUh0bWxFbnRpdHkoKTtcbiAgICAgICAgICAgICRzY29wZS5ob3RlbFBvbGljeSA9IGRhdGEuSG90ZWxEZXRhaWxzLmhvdGVsUG9saWN5LmRlY29kZUh0bWxFbnRpdHkoKTtcbiAgICAgICAgICAgICRzY29wZS5wcm9wZXJ0SW5mb3JtYXRpb24gPSBkYXRhLkhvdGVsRGV0YWlscy5wcm9wZXJ0eUluZm9ybWF0aW9uLmRlY29kZUh0bWxFbnRpdHkoKTtcblxuICAgICAgICAgICAgJHNjb3BlLm1hcC5zZXRDb29yZGluYXRlcyhkYXRhLkhvdGVsU3VtbWFyeS5sYXRpdHVkZSwgZGF0YS5Ib3RlbFN1bW1hcnkubG9uZ2l0dWRlKTtcbiAgICAgICAgICAgICRzY29wZS5wcm9wZXJ0eUFtZW5pdGllcyA9IGRhdGEuUHJvcGVydHlBbWVuaXRpZXMuUHJvcGVydHlBbWVuaXR5O1xuICAgICAgICAgICAgLy8gVE9ETzogU2V0IGhvdGVsUmF0aW5nXG4gICAgICAgICAgICAkc2NvcGUuc3RhclJhdGluZyA9IGRhdGEuSG90ZWxTdW1tYXJ5LmhvdGVsUmF0aW5nO1xuICAgICAgICAgICAgJHNjb3BlLnRyaXBBZHZpc29yID0gZGF0YS5Ib3RlbFN1bW1hcnkudHJpcEFkdmlzb3JSYXRpbmdVcmw7XG4gICAgICAgIH0pO1xuICAgICRzY29wZS5nZXRCZWRUeXBlcyA9IGZ1bmN0aW9uKGJlZFR5cGVzKXtcbiAgICAgICAgaWYoYmVkVHlwZXNbJ0BzaXplJ10gPiAxKXtcbiAgICAgICAgICAgIHJldHVybiAnPGkgY2xhc3M9XCJmYS1saSBmYSBmYS1iZWRcIj48L2k+JytiZWRUeXBlcy5CZWRUeXBlWzBdLmRlc2NyaXB0aW9uKyc8aSBjbGFzcz1cImZhLWxpIGZhIGZhLWJlZFwiPjwvaT4nK2JlZFR5cGVzLkJlZFR5cGVbMV0uZGVzY3JpcHRpb247XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gJzxpIGNsYXNzPVwiZmEtbGkgZmEgZmEtYmVkXCI+PC9pPicrYmVkVHlwZXMuQmVkVHlwZS5kZXNjcmlwdGlvbjtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLy8gVmFsdWUgQWRkc1xuICAgICRzY29wZS52YWx1ZUFkZEljb25HZW5lcmF0b3IgPSBmdW5jdGlvbih2YWx1ZUFkZCl7XG4gICAgICAgIHJldHVybiBWYWx1ZUFkZHMuZ2VuZXJhdGVJY29uKHZhbHVlQWRkKTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLnNlbGVjdFJvb20gPSBmdW5jdGlvbihyb29tKXtcbiAgICAgICAgdmFyIHJhdGVLZXkgPSByb29tLlJhdGVJbmZvcy5SYXRlSW5mby5Sb29tR3JvdXAuUm9vbS5yYXRlS2V5O1xuICAgICAgICB2YXIgcm9vbVR5cGVDb2RlID0gcm9vbS5yb29tVHlwZUNvZGU7XG4gICAgICAgIHZhciByYXRlQ29kZSA9IHJvb20ucmF0ZUNvZGU7XG4gICAgICAgIHZhciBjaGFyZ2VhYmxlUmF0ZSA9IGVuY29kZVVSSUNvbXBvbmVudChyb29tLlJhdGVJbmZvcy5SYXRlSW5mby5DaGFyZ2VhYmxlUmF0ZUluZm9bJ0B0b3RhbCddKTtcblxuICAgICAgICAkbG9jYXRpb24ucGF0aCgnL2Jvb2svJytob3RlbElkKycvJytjaGVja0luKycvJytjaGVja091dCsnLycrcmF0ZUtleSsnLycrcm9vbVR5cGVDb2RlKycvJytyYXRlQ29kZSsnLycrY2hhcmdlYWJsZVJhdGUpO1xuICAgIH07XG59XSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbnRyb2xsZXIoJ0Jvb2tDdHJsJywgWyckc2NvcGUnLCAnJGh0dHAnLCAnJHJvdXRlUGFyYW1zJywgJyRsb2NhdGlvbicsIGZ1bmN0aW9uKCRzY29wZSwgJGh0dHAsICRyb3V0ZVBhcmFtcywgJGxvY2F0aW9uKXtcclxuICAgIHZhciBob3RlbElkID0gJHJvdXRlUGFyYW1zLmhvdGVsSWQ7XHJcbiAgICB2YXIgY2hlY2tJbiA9ICRyb3V0ZVBhcmFtcy5jaGVja0luO1xyXG4gICAgdmFyIGNoZWNrT3V0ID0gJHJvdXRlUGFyYW1zLmNoZWNrT3V0O1xyXG4gICAgdmFyIHJhdGVLZXkgPSAkcm91dGVQYXJhbXMucmF0ZUtleTtcclxuICAgIHZhciByb29tVHlwZUNvZGUgPSAkcm91dGVQYXJhbXMucm9vbVR5cGVDb2RlO1xyXG4gICAgdmFyIHJhdGVDb2RlID0gJHJvdXRlUGFyYW1zLnJhdGVDb2RlO1xyXG4gICAgdmFyIGNoYXJnZWFibGVSYXRlID0gZW5jb2RlVVJJQ29tcG9uZW50KCRyb3V0ZVBhcmFtcy5jaGFyZ2VhYmxlUmF0ZSk7XHJcblxyXG4gICAgJHNjb3BlLmJvb2tpbmcgPSB7XHJcbiAgICAgICAgZmlyc3ROYW1lOiAndGVzdCcsXHJcbiAgICAgICAgbGFzdE5hbWU6ICdib29raW5nJyxcclxuICAgICAgICBlbWFpbDogJ2JvZ2RhbmRvcmNhQGdtYWlsLmNvbScsXHJcbiAgICAgICAgcGhvbmU6ICcwMDQwNzYzMTkxNTQzJyxcclxuICAgICAgICBjYXJkTnVtYmVyOiAnNTQwMTk5OTk5OTk5OTk5OScsXHJcbiAgICAgICAgY2FyZFR5cGU6ICdDQScsXHJcbiAgICAgICAgY2FyZEN2djogJzEyMycsXHJcbiAgICAgICAgY2FyZE1vbnRoOiAnMDYnLFxyXG4gICAgICAgIGNhcmRZZWFyOiAnMjAxNycsXHJcbiAgICAgICAgY2FyZEZpcnN0TmFtZTogJ1Rlc3QnLFxyXG4gICAgICAgIGNhcmRMYXN0TmFtZTogJ0Jvb2tpbmcnLFxyXG4gICAgICAgIGFkZHJlc3M6ICd0cmF2ZWxub3cnLFxyXG4gICAgICAgIGNpdHk6ICd0cmF2ZWxub3cnLFxyXG4gICAgICAgIHByb3ZpbmNlOiAnJyxcclxuICAgICAgICBjb3VudHJ5OiAnUk8nLFxyXG4gICAgICAgIHBvc3RhbENvZGU6ICc1MTU0MDAnXHJcbiAgICB9O1xyXG4gICAgJHNjb3BlLmJvb2sgPSBmdW5jdGlvbihib29raW5nKXtcclxuICAgICAgICAkaHR0cC5wb3N0KCcvYXBpL2Jvb2svJytob3RlbElkKycvJytjaGVja0luKycvJytjaGVja091dCsnLycrcmF0ZUtleSsnLycrcm9vbVR5cGVDb2RlKycvJytyYXRlQ29kZSsnLycrY2hhcmdlYWJsZVJhdGUsIHtcclxuICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgICAgZmlyc3ROYW1lOiAkc2NvcGUuYm9va2luZy5maXJzdE5hbWUsXHJcbiAgICAgICAgICAgICAgICBsYXN0TmFtZTogJHNjb3BlLmJvb2tpbmcubGFzdE5hbWUsXHJcbiAgICAgICAgICAgICAgICBlbWFpbDogJHNjb3BlLmJvb2tpbmcuZW1haWwsXHJcbiAgICAgICAgICAgICAgICBwaG9uZTogJHNjb3BlLmJvb2tpbmcucGhvbmUsXHJcbiAgICAgICAgICAgICAgICBjYXJkTnVtYmVyOiAkc2NvcGUuYm9va2luZy5jYXJkTnVtYmVyLFxyXG4gICAgICAgICAgICAgICAgY2FyZFR5cGU6ICRzY29wZS5ib29raW5nLmNhcmRUeXBlLFxyXG4gICAgICAgICAgICAgICAgY2FyZEN2djogJHNjb3BlLmJvb2tpbmcuY2FyZEN2dixcclxuICAgICAgICAgICAgICAgIGNhcmRNb250aDogJHNjb3BlLmJvb2tpbmcuY2FyZE1vbnRoLFxyXG4gICAgICAgICAgICAgICAgY2FyZFllYXI6ICRzY29wZS5ib29raW5nLmNhcmRZZWFyLFxyXG4gICAgICAgICAgICAgICAgY2FyZEZpcnN0TmFtZTogJHNjb3BlLmJvb2tpbmcuY2FyZEZpcnN0TmFtZSxcclxuICAgICAgICAgICAgICAgIGNhcmRMYXN0TmFtZTogJHNjb3BlLmJvb2tpbmcuY2FyZExhc3ROYW1lLFxyXG4gICAgICAgICAgICAgICAgYWRkcmVzczogJHNjb3BlLmJvb2tpbmcuYWRkcmVzcyxcclxuICAgICAgICAgICAgICAgIGNpdHk6ICRzY29wZS5ib29raW5nLmNpdHksXHJcbiAgICAgICAgICAgICAgICBwcm92aW5jZTogJHNjb3BlLmJvb2tpbmcucHJvdmluY2UsXHJcbiAgICAgICAgICAgICAgICBjb3VudHJ5OiAkc2NvcGUuYm9va2luZy5jb3VudHJ5LFxyXG4gICAgICAgICAgICAgICAgcG9zdGFsQ29kZTogJHNjb3BlLmJvb2tpbmcucG9zdGFsQ29kZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICAgICAgLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSl7XHJcbiAgICAgICAgICAgICAgICBkYXRhID0gZGF0YS5Ib3RlbFJvb21SZXNlcnZhdGlvblJlc3BvbnNlO1xyXG4gICAgICAgICAgICAgICAgdmFyIGl0aW5lcmFyeUlkID0gZGF0YS5pdGluZXJhcnlJZDtcclxuICAgICAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvY29uZmlybWF0aW9uLycraXRpbmVyYXJ5SWQrJy8nKyRzY29wZS5ib29raW5nLmVtYWlsKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmVycm9yKGZ1bmN0aW9uKGVycil7XHJcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBlcnJvciBjYXRjaFxyXG4gICAgICAgICAgICB9KTtcclxuICAgIH07XHJcbn1dKTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwJykuY29udHJvbGxlcignQ29uZmlybWF0aW9uQ3RybCcsIFsnJHNjb3BlJywgJyRodHRwJywgJyRyb3V0ZVBhcmFtcycsIGZ1bmN0aW9uKCRzY29wZSwgJGh0dHAsICRyb3V0ZVBhcmFtcyl7XHJcbiAgICB2YXIgaXRpbmVyYXJ5SWQgPSAkcm91dGVQYXJhbXMuaXRpbmVyYXJ5SWQsXHJcbiAgICAgICAgZW1haWwgPSAkcm91dGVQYXJhbXMuZW1haWw7XHJcbiAgICAkc2NvcGUuaGVhZGluZyA9IGl0aW5lcmFyeUlkO1xyXG4gICAgJGh0dHAuZ2V0KCcvYXBpL2l0aW5lcmFyeS8nK2l0aW5lcmFyeUlkKycvJytlbWFpbClcclxuICAgICAgICAuc3VjY2VzcyhmdW5jdGlvbihkYXRhKXtcclxuICAgICAgICAgICAgZGF0YSA9IGRhdGEuSG90ZWxJdGluZXJhcnlSZXNwb25zZTtcclxuICAgICAgICAgICAgJHNjb3BlLmhlYWRpbmcgPSBkYXRhLkl0aW5lcmFyeS5pdGluZXJhcnlJZDtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5lcnJvcihmdW5jdGlvbihlcnIpe1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xyXG4gICAgICAgIH0pO1xyXG59XSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbnRyb2xsZXIoJ0xpc3RDdHJsJywgWyckc2NvcGUnLCAnJGh0dHAnLCAnJHJvdXRlUGFyYW1zJywgJyRsb2NhdGlvbicsICdIb3RlbExpc3QnLCAnRWFuSW1hZ2UnLCBmdW5jdGlvbigkc2NvcGUsICRodHRwLCAkcm91dGVQYXJhbXMsICRsb2NhdGlvbiwgSG90ZWxMaXN0LCBFYW5JbWFnZSl7XHJcbiAgICAkc2NvcGUuaG90ZWxMaXN0ID0gW107XHJcbiAgICAkc2NvcGUudGl0bGUgPSAnU2VsZWN0IHlvdXIgZmF2b3JpdGUgaG90ZWwnO1xyXG4gICAgJHNjb3BlLnRyYW5zbGF0ZSA9IGZ1bmN0aW9uKGltYWdlVXJsKXtcclxuICAgICAgICByZXR1cm4gRWFuSW1hZ2UudHJhbnNsYXRlKGltYWdlVXJsLCAndCcsICdsJyk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIFBhcmFtc1xyXG4gICAgdmFyIHR5cGUgPSAkcm91dGVQYXJhbXMudHlwZTtcclxuICAgIHZhciBkZXN0aW5hdGlvbklkID0gJHJvdXRlUGFyYW1zLmRlc3RpbmF0aW9uO1xyXG4gICAgdmFyIGNoZWNrSW4gPSAkcm91dGVQYXJhbXMuY2hlY2tJbjtcclxuICAgIHZhciBjaGVja091dCA9ICRyb3V0ZVBhcmFtcy5jaGVja091dDtcclxuICAgIEhvdGVsTGlzdC5nZXRIb3RlbExpc3QodHlwZSwgZGVzdGluYXRpb25JZCwgY2hlY2tJbiwgY2hlY2tPdXQpLnRoZW4oZnVuY3Rpb24oZGF0YSl7XHJcbiAgICAgICAgaWYoIWRhdGEuRWFuV3NFcnJvcil7XHJcbiAgICAgICAgICAgIGlmKHR5cGU9PT0naG90ZWwnKXtcclxuICAgICAgICAgICAgICAgICRzY29wZS5ob3RlbFNlbGVjdChkYXRhLkhvdGVsTGlzdC5Ib3RlbFN1bW1hcnkuaG90ZWxJZCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZihkYXRhLkhvdGVsTGlzdC5Ib3RlbFN1bW1hcnkuY29uc3RydWN0b3IgPT09IEFycmF5KXtcclxuICAgICAgICAgICAgICAgICRzY29wZS5ob3RlbExpc3QgPSBkYXRhLkhvdGVsTGlzdC5Ib3RlbFN1bW1hcnk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuaG90ZWxMaXN0LnB1c2goZGF0YS5Ib3RlbExpc3QuSG90ZWxTdW1tYXJ5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGFsZXJ0KCdJbmNvcnJlY3QgaW5mbycpO1xyXG4gICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnLycpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgSG90ZWxMaXN0LmdldERlc3RpbmF0aW9uRGV0YWlscyhkZXN0aW5hdGlvbklkKS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICAgICRzY29wZS50aXRsZSA9IGRhdGEuTmFtZTtcclxuICAgIH0pO1xyXG4gICAgJHNjb3BlLmhvdGVsU2VsZWN0ID0gZnVuY3Rpb24oaG90ZWxJZCl7XHJcbiAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy9hdmFpbC8nK2hvdGVsSWQrJy8nK2NoZWNrSW4rJy8nK2NoZWNrT3V0KTtcclxuICAgIH07XHJcbn1dKTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwJykuY29udHJvbGxlcignU2VhcmNoQ3RybCcsIFsnJHNjb3BlJywgJyRsb2NhdGlvbicsICdQb3B1bGFyRGVzdGluYXRpb25zJywgJ0RhdGVQaWNrZXInLCAnVG9hc3RyJywgZnVuY3Rpb24oJHNjb3BlLCAkbG9jYXRpb24sIFBvcHVsYXJEZXN0aW5hdGlvbnMsIERhdGVQaWNrZXIsIFRvYXN0cil7XHJcbiAgICAvLyBDaGVjay1pblxyXG4gICAgJHNjb3BlLmNpZHQgPSBEYXRlUGlja2VyLm5ld0RhdGUoMSwgMCwgMCwgJ2RkL21tL3l5eXknKTtcclxuICAgICRzY29wZS5jaGVja0luTWluRGF0ZSA9ICRzY29wZS5jaGVja0luTWluRGF0ZSA/IG51bGwgOiBuZXcgRGF0ZShEYXRlUGlja2VyLm5ld0RhdGUoMSwgMCwgMCwgJ21tL2RkL3l5eXknKSk7XHJcbiAgICAkc2NvcGUuY2hlY2tJbk1heERhdGUgPSBuZXcgRGF0ZShEYXRlUGlja2VyLm5ld0RhdGUoMSwgMywgMCwgJ21tL2RkL3l5eXknKSk7XHJcblxyXG4gICAgJHNjb3BlLmNvZHQgPSBEYXRlUGlja2VyLm5ld0RhdGUoMywgMCwgMCwgJ2RkL21tL3l5eXknKTtcclxuICAgICRzY29wZS5jaGVja091dE1pbkRhdGUgPSAkc2NvcGUuY2hlY2tPdXRNaW5EYXRlID8gbnVsbCA6IG5ldyBEYXRlKERhdGVQaWNrZXIubmV3RGF0ZSgzLCAwLCAwLCAnbW0vZGQveXl5eScpKTtcclxuICAgICRzY29wZS5jaGVja091dE1heERhdGUgPSBuZXcgRGF0ZShEYXRlUGlja2VyLm5ld0RhdGUoMiwgMywgMCwgJ21tL2RkL3l5eXknKSk7XHJcblxyXG5cclxuICAgICRzY29wZS5jaGVja0luT3BlbmVkID0gZmFsc2U7XHJcbiAgICAkc2NvcGUuY2hlY2tPdXRPcGVuZWQgPSBmYWxzZTtcclxuXHJcbiAgICAkc2NvcGUuZGF0ZXBpY2tlck9wZW4gPSBmdW5jdGlvbigkZXZlbnQsIHBhbmVsKXtcclxuICAgICAgICAkZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgJHNjb3BlLmNoZWNrSW5PcGVuZWQgPSAocGFuZWwgPT09ICdjaGVja0luJyk7XHJcbiAgICAgICAgJHNjb3BlLmNoZWNrT3V0T3BlbmVkID0gKHBhbmVsID09PSAnY2hlY2tPdXQnKTtcclxuICAgIH07XHJcbiAgICAkc2NvcGUuZGF0ZU9wdGlvbnMgPSBEYXRlUGlja2VyLmRhdGVPcHRpb25zO1xyXG4gICAgJHNjb3BlLmZvcm1hdCA9IERhdGVQaWNrZXIuZm9ybWF0O1xyXG5cclxuICAgIC8vIFJlY29tbWVuZGVkIGRlc3RpbmF0aW9uc1xyXG4gICAgJHNjb3BlLnBvcHVsYXJEZXN0aW5hdGlvbnMgPSBbXTtcclxuICAgICRzY29wZS5wb3B1bGFyRGVzdGluYXRpb25zTG9hZGVyID0gdHJ1ZTtcclxuICAgIC8vIERlZmF1bHQgZGF0ZXMgdG8gc2VhcmNoIGZvclxyXG4gICAgJHNjb3BlLmRlZmF1bHRDaGVja0luID0gRGF0ZVBpY2tlci5uZXdEYXRlKDIsIDAsIDAsICdkZC1tbS15eXl5Jyk7XHJcbiAgICAkc2NvcGUuZGVmYXVsdENoZWNrT3V0ID0gRGF0ZVBpY2tlci5uZXdEYXRlKDUsIDAsIDAsICdkZC1tbS15eXl5Jyk7XHJcbiAgICBQb3B1bGFyRGVzdGluYXRpb25zLmdldFBvcHVsYXJEZXN0aW5hdGlvbnMoKS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICAgICRzY29wZS5wb3B1bGFyRGVzdGluYXRpb25zID0gZGF0YTtcclxuICAgICAgICAkc2NvcGUucG9wdWxhckRlc3RpbmF0aW9uc0xvYWRlciA9IGZhbHNlO1xyXG4gICAgfSk7XHJcblxyXG5cclxuICAgIC8vIEZvcm1cclxuICAgICRzY29wZS5zZWFyY2hIb3RlbHMgPSBmdW5jdGlvbihkZXN0aW5hdGlvbiwgY2hlY2tJbiwgY2hlY2tPdXQpe1xyXG4gICAgICAgIC8vIFRPRE86IFNldC11cCB2YWxpZGF0aW9uXHJcbiAgICAgICAgaWYoZGVzdGluYXRpb24gJiYgZGVzdGluYXRpb24uVHlwZSAmJiBkZXN0aW5hdGlvbi5EZXN0aW5hdGlvbklkKXtcclxuICAgICAgICAgICAgaWYoY2hlY2tJbiAmJiBjaGVja091dCApe1xyXG4gICAgICAgICAgICAgICAgdG9hc3RyLmNsZWFyKCk7XHJcbiAgICAgICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnL2xpc3QvJytkZXN0aW5hdGlvbi5UeXBlKycvJytkZXN0aW5hdGlvbi5EZXN0aW5hdGlvbklkKycvJytEYXRlUGlja2VyLnJlcGxhY2VEYXRlU2VwYXJhdG9yKGNoZWNrSW4pKycvJytEYXRlUGlja2VyLnJlcGxhY2VEYXRlU2VwYXJhdG9yKGNoZWNrT3V0KSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBUb2FzdHIuZXJyb3JUb2FzdCgnVGhlIGRhdGVzIHNlbGVjdGVkIGFyZSBpbmNvcnJlY3QuJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBUb2FzdHIuZXJyb3JUb2FzdCgnVGhlIGRlc3RpbmF0aW9uIGVudGVyZWQgaXMgaW5jb3JyZWN0LicpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn1dKTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwJykuZmFjdG9yeSgnRGF0ZVBpY2tlcicsIFtmdW5jdGlvbigpe1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBmb3JtYXREYXRlOiBmdW5jdGlvbihkYXksIG1vbnRoLCB5ZWFyLCBmb3JtYXQpe1xyXG4gICAgICAgICAgICBpZihmb3JtYXQgPT09ICdkZC9tbS95eXl5Jyl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKGRheS50b1N0cmluZygpLmRtRm9ybWF0KCkpKycvJysobW9udGgudG9TdHJpbmcoKS5kbUZvcm1hdCgpKSsnLycreWVhcjtcclxuICAgICAgICAgICAgfSBlbHNlIGlmKGZvcm1hdCA9PT0gJ21tL2RkL3l5eXknKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiAobW9udGgudG9TdHJpbmcoKS5kbUZvcm1hdCgpKSsnLycrKGRheS50b1N0cmluZygpLmRtRm9ybWF0KCkpKycvJyt5ZWFyO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYoZm9ybWF0ID09PSAneXl5eS9tbS9kZCcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB5ZWFyICsgJy8nICsgKG1vbnRoLnRvU3RyaW5nKCkuZG1Gb3JtYXQoKSkgKyAnLycgKyAoZGF5LnRvU3RyaW5nKCkuZG1Gb3JtYXQoKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZihmb3JtYXQgPT09ICdkZC1tbS15eXl5Jykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIChkYXkudG9TdHJpbmcoKS5kbUZvcm1hdCgpKSsnLScrKG1vbnRoLnRvU3RyaW5nKCkuZG1Gb3JtYXQoKSkrJy0nK3llYXI7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZihmb3JtYXQgPT09ICdtbS1kZC15eXl5Jykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICgobW9udGgudG9TdHJpbmcoKS5kbUZvcm1hdCgpKSsnLScrZGF5LnRvU3RyaW5nKCkuZG1Gb3JtYXQoKSkrJy0nK3llYXI7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIG5ld0RhdGU6IGZ1bmN0aW9uKGRheURlbGF5LCBtb250aERlbGF5LCB5ZWFyRGVsYXksIGZvcm1hdCl7XHJcbiAgICAgICAgICAgIHZhciBkYXRlID0gbmV3IERhdGUoKTtcclxuICAgICAgICAgICAgZGF0ZS5zZXREYXRlKGRhdGUuZ2V0RGF0ZSgpICsgZGF5RGVsYXkpO1xyXG5cclxuICAgICAgICAgICAgdmFyIGRheSA9IGRhdGUuZ2V0RGF0ZSgpLnRvU3RyaW5nKCkuZG1Gb3JtYXQoKTtcclxuICAgICAgICAgICAgdmFyIG1vbnRoID0gKGRhdGUuZ2V0TW9udGgoKSArIDEgKyBtb250aERlbGF5KS50b1N0cmluZygpLmRtRm9ybWF0KCk7XHJcbiAgICAgICAgICAgIHZhciB5ZWFyID0gZGF0ZS5nZXRGdWxsWWVhcigpICsgeWVhckRlbGF5O1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZm9ybWF0RGF0ZShkYXksIG1vbnRoLCB5ZWFyLCBmb3JtYXQpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVwbGFjZURhdGVTZXBhcmF0b3I6IGZ1bmN0aW9uKG9sZERhdGUpe1xyXG4gICAgICAgICAgICBpZihvbGREYXRlLmNvbnN0cnVjdG9yICE9PSBTdHJpbmcpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZm9ybWF0RGF0ZShvbGREYXRlLmdldERhdGUoKSwgKG9sZERhdGUuZ2V0TW9udGgoKSsxKSwgb2xkRGF0ZS5nZXRGdWxsWWVhcigpLCAnZGQtbW0teXl5eScpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9sZERhdGUucmVwbGFjZSgnLycsICctJykucmVwbGFjZSgnLycsICctJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGRhdGVPcHRpb25zOiB7XHJcbiAgICAgICAgICAgIGZvcm1hdFllYXI6ICd5eScsXHJcbiAgICAgICAgICAgIHN0YXJ0aW5nRGF5OiAxXHJcbiAgICAgICAgfSxcclxuICAgICAgICBmb3JtYXRzOiBbJ2RkL01NL3l5eXknLCAneXl5eS9NTS9kZCcsICdkZC9NTS95eXl5JywgJ3Nob3J0RGF0ZSddLFxyXG4gICAgICAgIGZvcm1hdDogJ2RkL01NL3l5eXknXHJcbiAgICB9O1xyXG59XSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmZhY3RvcnkoJ0hvdGVsTGlzdCcsIFsnJGh0dHAnLCAnJHEnLCBmdW5jdGlvbigkaHR0cCwgJHEpe1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBnZXRIb3RlbExpc3Q6IGZ1bmN0aW9uKHR5cGUsIGRlc3RpbmF0aW9uSWQsIGNoZWNrSW4sIGNoZWNrT3V0KXtcclxuICAgICAgICAgICAgdmFyIGRlZmVyID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgJGh0dHAuZ2V0KCcvYXBpL2xpc3QvJyt0eXBlKycvJytkZXN0aW5hdGlvbklkKycvJytjaGVja0luKycvJytjaGVja091dCsnLzInKVxyXG4gICAgICAgICAgICAgICAgLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSl7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoZGF0YS5sZW5ndGggIT09IDApe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlci5yZXNvbHZlKGRhdGEuSG90ZWxMaXN0UmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXIucHJvbWlzZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldERlc3RpbmF0aW9uRGV0YWlsczogZnVuY3Rpb24oZGVzdGluYXRpb25JZCl7XHJcbiAgICAgICAgICAgIHZhciBkZWZlciA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgICRodHRwLmdldCgnL2FwaS9kZXN0aW5hdGlvbi9kZXRhaWxzLycrZGVzdGluYXRpb25JZClcclxuICAgICAgICAgICAgICAgIC5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVyLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmVycm9yKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXIucmVzb2x2ZSgnU2VsZWN0IHlvdXIgZmF2b3JpdGUgaG90ZWwnKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXIucHJvbWlzZTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59XSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmZhY3RvcnkoJ0VhbkltYWdlJywgW2Z1bmN0aW9uKCl7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHRyYW5zbGF0ZTogZnVuY3Rpb24oaW1hZ2UsIGZyb20sIHRvKXtcclxuICAgICAgICAgICAgcmV0dXJuIGltYWdlLnJlcGxhY2UoJ18nK2Zyb20rJy5qcGcnLCAnXycrdG8rJy5qcGcnKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxufV0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKS5mYWN0b3J5KCdQb3B1bGFyRGVzdGluYXRpb25zJywgWyckaHR0cCcsICckcScsIGZ1bmN0aW9uKCRodHRwLCAkcSl7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGdldFBvcHVsYXJEZXN0aW5hdGlvbnM6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgICRodHRwLmdldCgnL2FwaS9wb3B1bGFyLzcnKVxyXG4gICAgICAgICAgICAgICAgLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSl7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGluZGVudFNlbGVjdGlvbjogZnVuY3Rpb24oZGVzdGluYXRpb25JZCl7XHJcbiAgICAgICAgICAgICRodHRwLnBvc3QoJy9hcGkvcG9wdWxhci8nK2Rlc3RpbmF0aW9uSWQsIHt9KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59XSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmZhY3RvcnkoJ1RvYXN0cicsIFtmdW5jdGlvbigpe1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzVG9hc3Q6IGZ1bmN0aW9uKG1lc3NhZ2Upe1xyXG4gICAgICAgICAgICB0b2FzdHIub3B0aW9ucy5jbG9zZUJ1dHRvbiA9IHRydWU7XHJcbiAgICAgICAgICAgIHRvYXN0ci5vcHRpb25zLnByZXZlbnREdXBsaWNhdGVzID0gdHJ1ZTtcclxuICAgICAgICAgICAgdG9hc3RyLnN1Y2Nlc3MobWVzc2FnZSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlcnJvclRvYXN0OiBmdW5jdGlvbihtZXNzYWdlKXtcclxuICAgICAgICAgICAgdG9hc3RyLm9wdGlvbnMuY2xvc2VCdXR0b24gPSB0cnVlO1xyXG4gICAgICAgICAgICB0b2FzdHIub3B0aW9ucy5wcmV2ZW50RHVwbGljYXRlcyA9IHRydWU7XHJcbiAgICAgICAgICAgIHRvYXN0ci5lcnJvcihtZXNzYWdlKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59XSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmZhY3RvcnkoJ1ZhbHVlQWRkcycsIFtmdW5jdGlvbigpe1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBnZW5lcmF0ZUljb246IGZ1bmN0aW9uKHZhbHVlQWRkKXtcclxuICAgICAgICAgICAgaWYodmFsdWVBZGQgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlQWRkLmluZGV4T2YoJ0JyZWFrZmFzdCcpID4gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJzxpIGNsYXNzPVwiZmEgZmEtY3V0bGVyeSBmYS1saVwiPjwvaT4gJyArIHZhbHVlQWRkO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZUFkZC5pbmRleE9mKCdXaXJlbGVzcycpID4gLTEgfHwgdmFsdWVBZGQuaW5kZXhPZignSW50ZXJuZXQnKSA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICc8aSBjbGFzcz1cImZhIGZhLXdpZmkgZmEtbGlcIj48L2k+ICcgKyB2YWx1ZUFkZDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWVBZGQuaW5kZXhPZignUGFya2luZycpID4gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJzxpIGNsYXNzPVwiZmEgZmEtY2FyIGZhLWxpXCI+PC9pPiAnICsgdmFsdWVBZGQ7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnPGkgY2xhc3M9XCJmYSBmYS1tb25leSBmYS1saVwiPjwvaT4gJyArIHZhbHVlQWRkO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufV0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKS5maWx0ZXIoJ3Vuc2FmZScsIFsnJHNjZScsIGZ1bmN0aW9uKCRzY2UpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbihlbmNvZGVkVGV4dCl7XHJcbiAgICAgICAgcmV0dXJuICRzY2UudHJ1c3RBc0h0bWwoZW5jb2RlZFRleHQpO1xyXG4gICAgfTtcclxufV0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKS5kaXJlY3RpdmUoJ25nQXV0b2NvbXBsZXRlJywgWyckZG9jdW1lbnQnLCAnJGh0dHAnLCAnUG9wdWxhckRlc3RpbmF0aW9ucycsIGZ1bmN0aW9uKCRkb2N1bWVudCwgJGh0dHAsIFBvcHVsYXJEZXN0aW5hdGlvbnMpe1xyXG4gICAgdmFyIGxpbmtlciA9IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50KXtcclxuICAgICAgICAkZG9jdW1lbnQuY2xpY2soZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgc2NvcGUuJGFwcGx5KHNjb3BlLmhpZGVBdXRvY29tcGxldGUgPSB0cnVlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBlbGVtZW50LmNsaWNrKGZ1bmN0aW9uKGV2ZW50KXtcclxuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgdmFyIGNvbnRyb2xsZXIgPSBmdW5jdGlvbigkc2NvcGUpe1xyXG4gICAgICAgICRzY29wZS5hdXRvY29tcGxldGVMaXN0ID0ge1xyXG4gICAgICAgICAgICBjaXRpZXM6IFtdLFxyXG4gICAgICAgICAgICBob3RlbHM6IFtdLFxyXG4gICAgICAgICAgICBhaXJwb3J0czogW11cclxuICAgICAgICB9O1xyXG4gICAgICAgIHZhciByZXNldEF1dG9jb21wbGV0ZSA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICRzY29wZS5hdXRvY29tcGxldGVMaXN0ID0ge1xyXG4gICAgICAgICAgICAgICAgY2l0aWVzOiBbXSxcclxuICAgICAgICAgICAgICAgIGhvdGVsczogW10sXHJcbiAgICAgICAgICAgICAgICBhaXJwb3J0czogW11cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBHZXQgYXV0b2NvbXBsZXRlIGxpc3RcclxuICAgICAgICAkc2NvcGUuYXV0b2NvbXBsZXRlID0gZnVuY3Rpb24oZGVzdGluYXRpb24pe1xyXG4gICAgICAgICAgICBpZihkZXN0aW5hdGlvbi5sZW5ndGggPiAyKXtcclxuICAgICAgICAgICAgICAgICRodHRwLmdldCgnL2FwaS9hdXRvY29tcGxldGUvJytkZXN0aW5hdGlvbilcclxuICAgICAgICAgICAgICAgICAgICAuc3VjY2VzcyhmdW5jdGlvbihkYXRhKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzZXRBdXRvY29tcGxldGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBpPTA7aTxkYXRhLmxlbmd0aDtpKyspe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoZGF0YVtpXS5UeXBlID09PSAnY2l0eScpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5hdXRvY29tcGxldGVMaXN0LmNpdGllcy5wdXNoKGRhdGFbaV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmKGRhdGFbaV0uVHlwZSA9PT0gJ2hvdGVsJyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmF1dG9jb21wbGV0ZUxpc3QuaG90ZWxzLnB1c2goZGF0YVtpXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYoZGF0YVtpXS5UeXBlID09PSAnYWlycG9ydCcpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5hdXRvY29tcGxldGVMaXN0LmFpcnBvcnRzLnB1c2goZGF0YVtpXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuaGlkZUF1dG9jb21wbGV0ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXNldEF1dG9jb21wbGV0ZSgpO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmhpZGVBdXRvY29tcGxldGUgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gQ2F0ZWdvcnkgaGlkZVxyXG4gICAgICAgICRzY29wZS5jaXRpZXNBcnJheUlzRW1wdHkgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICByZXR1cm4gKCRzY29wZS5hdXRvY29tcGxldGVMaXN0LmNpdGllcy5sZW5ndGggPT09IDApO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgJHNjb3BlLmhvdGVsc0FycmF5SXNFbXB0eSA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHJldHVybiAoJHNjb3BlLmF1dG9jb21wbGV0ZUxpc3QuaG90ZWxzLmxlbmd0aCA9PT0gMCk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICAkc2NvcGUuYWlycG9ydHNBcnJheUlzRW1wdHkgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICByZXR1cm4gKCRzY29wZS5hdXRvY29tcGxldGVMaXN0LmFpcnBvcnRzLmxlbmd0aCA9PT0gMCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gQXV0b2NvbXBsZXRlIGhpZGVcclxuICAgICAgICAkc2NvcGUuaGlkZUF1dG9jb21wbGV0ZSA9IHRydWU7XHJcbiAgICAgICAgdmFyIGF1dG9jb21wbGV0ZUxpc3RJc0VtcHR5ID0gZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgcmV0dXJuICgkc2NvcGUuYXV0b2NvbXBsZXRlTGlzdC5jaXRpZXMubGVuZ3RoID09PSAwICYmICRzY29wZS5hdXRvY29tcGxldGVMaXN0LmhvdGVscy5sZW5ndGggPT09IDAgJiYgJHNjb3BlLmF1dG9jb21wbGV0ZUxpc3QuYWlycG9ydHMubGVuZ3RoID09PSAwKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgICRzY29wZS5hdXRvY29tcGxldGVJc0hpZGRlbiA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHJldHVybiAoYXV0b2NvbXBsZXRlTGlzdElzRW1wdHkoKSB8fCAkc2NvcGUuaGlkZUF1dG9jb21wbGV0ZSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gQXV0b2NvbXBsZXRlIHNlbGVjdFxyXG4gICAgICAgICRzY29wZS5zZWxlY3REZXN0aW5hdGlvbiA9IGZ1bmN0aW9uKGl0ZW0sIHR5cGUpe1xyXG4gICAgICAgICAgICAkc2NvcGUuZGVzdGluYXRpb24gPSBpdGVtLk5hbWU7XHJcbiAgICAgICAgICAgICRzY29wZS5zZWxlY3RlZERlc3RpbmF0aW9uID0gaXRlbTtcclxuICAgICAgICAgICAgUG9wdWxhckRlc3RpbmF0aW9ucy5pbmRlbnRTZWxlY3Rpb24oaXRlbS5EZXN0aW5hdGlvbklkKTtcclxuICAgICAgICAgICAgcmVzZXRBdXRvY29tcGxldGUoKTtcclxuICAgICAgICB9O1xyXG4gICAgfTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgICAgICBsaW5rOiBsaW5rZXIsXHJcbiAgICAgICAgY29udHJvbGxlcjogY29udHJvbGxlcixcclxuICAgICAgICB0ZW1wbGF0ZVVybDogJy4vcGFydGlhbHMvaW5kZXgvYXV0b2NvbXBsZXRlJ1xyXG4gICAgfTtcclxufV0pOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==