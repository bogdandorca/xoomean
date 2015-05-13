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
            return oldDate.replace('/', '-').replace('/', '-');
        },
        dateOptions: {
            formatYear: 'yy',
            startingDay: 1
        },
        formats: ['dd/MM/yyyy', 'yyyy/MM/dd', 'dd/MM/yyyy', 'shortDate'],
        format: 'dd/MM/yyyy'
    };
}]);