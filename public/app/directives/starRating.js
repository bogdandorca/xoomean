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