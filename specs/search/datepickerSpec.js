describe('DatePicker service', function(){
    var factory;
    beforeEach(function(){
        module('app');

        inject(function($injector){
            factory = $injector.get('DatePicker');
        });
    });

    describe('Date format', function(){

        it('should get the correct format of the date', function(){
            var acceptedDates = [
                { format: 'dd/mm/yyyy', accepted: '19/09/2016' },
                { format: 'mm/dd/yyyy', accepted: '09/19/2016' },
                { format: 'yyyy/mm/dd', accepted: '2016/09/19' },
                { format: 'dd-mm-yyyy', accepted: '19-09-2016' }
            ];
            for(var i=0;i<acceptedDates.length;i++){
                expect(factory.formatDate(19, 9, 2016, acceptedDates[i].format)).toBe(acceptedDates[i].accepted);
            }
        });

        it('should return empty if the format is not accepted', function(){
            var incorrectFormat = 'yy/d/mm';
            expect(factory.formatDate(19, 9, 2016, incorrectFormat)).toBe('');
        });

    });
});