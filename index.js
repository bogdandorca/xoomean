var express = require('express');
var env = process.env.NODE_ENV || 'development';

var app = express();
var config = require('./server/repo/config');
// Environment general set-up
require('./server/repo/environment')(app, express);

// Message styling helper
var msg = require('./server/repo/message-log');
// Database connection
require('./server/repo/database')(config, msg, env);

// Models
require('./server/models/autocomplete')();
require('./server/models/hotel')();

// Views
require('./server/views/autocomplete')(app);
require('./server/views/popularDestinations')(app);
require('./server/views/list')(app);
require('./server/views/avail')(app);
require('./server/views/hotelDetails')(app);
require('./server/views/book')(app);

// Callback
app.get('*', function(req, res){
    res.render('index');
});

app.listen(config[env].port);
console.log(msg.success('Listening on ' + config[env].port));