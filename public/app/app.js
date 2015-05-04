angular.module('app', ['ngRoute', 'ui.bootstrap']).config(function($routeProvider, $locationProvider){
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
        .otherwise({
            redirectTo: '/'
        });
});