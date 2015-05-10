angular.module('app').factory('EanImage', function(){
    return {
        translate: function(image, from, to){
            return image.replace('_'+from+'.jpg', '_'+to+'.jpg');
        }
    }

});