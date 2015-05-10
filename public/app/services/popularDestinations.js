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
    }
}]);