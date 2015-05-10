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
    }
}]);