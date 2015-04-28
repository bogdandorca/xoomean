var autocompleteCtrl = require('../controllers/autocomplete');

module.exports = function(app){
    app.get('/api/autocomplete/:destination', function(req, res){
        autocompleteCtrl.getAutocompleteData(req.params.destination, res);
    });
};