describe('Popular destination service', function(){
    var factory;
    beforeEach(function(){
        module('app');

        inject(function($injector){
            factory = $injector.get('PopularDestinations');
        });
    });

   it('Should check something', function(){

   });
});