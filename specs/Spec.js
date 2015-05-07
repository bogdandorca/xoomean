describe('My first unit test', function(){
    var scope;
    beforeEach(angular.mock.module('app'));
    beforeEach(inject(function($rootScope, $controller){
        scope = $rootScope.$new();
        $controller('ListCtrl', {
            $scope: scope
        });
    }));
    it('should do some check', function(){
        expect(scope.hotelList.length).toBe(0);
    })
});