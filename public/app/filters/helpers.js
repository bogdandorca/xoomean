angular.module('app').filter('unsafe', ['$sce', function($sce) {
    return function(encodedText){
        return $sce.trustAsHtml(encodedText);
    };
}]);