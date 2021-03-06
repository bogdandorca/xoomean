angular.module('app').factory('ValueAdds', [function(){
    return {
        generateIcon: function(valueAdd){
            if(valueAdd !== undefined) {
                if (valueAdd.indexOf('Breakfast') > -1) {
                    return '<i class="fa fa-cutlery fa-li"></i> ' + valueAdd;
                } else if (valueAdd.indexOf('Wireless') > -1 || valueAdd.indexOf('Internet') > -1) {
                    return '<i class="fa fa-wifi fa-li"></i> ' + valueAdd;
                } else if (valueAdd.indexOf('Parking') > -1) {
                    return '<i class="fa fa-car fa-li"></i> ' + valueAdd;
                } else {
                    return '<i class="fa fa-money fa-li"></i> ' + valueAdd;
                }
            }
        }
    };
}]);