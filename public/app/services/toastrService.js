angular.module('app').factory('Toastr', [function(){
    return {
        successToast: function(message){
            toastr.options.closeButton = true;
            toastr.options.preventDuplicates = true;
            toastr.success(message);
        },
        errorToast: function(message){
            toastr.options.closeButton = true;
            toastr.options.preventDuplicates = true;
            toastr.error(message);
        }
    };
}]);