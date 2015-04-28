angular.module('app', ['ngRoute']).config(function($routeProvider, $locationProvider){
    $locationProvider.html5Mode(true);
    $routeProvider
        .when('/', {
            templateUrl: '/partials/search',
            controller: 'SearchCtrl'
        });
});