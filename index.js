var express = require('express');

var env = process.env.NODE_ENV || 'development';
var app = express();
var config = require('./server/repo/config');
// Environment general set-up
require('./server/repo/environment')(app, express);

// Message styling helper
var msg = require('./server/repo/message-log');
// Database connection
require('./server/repo/database')(config, msg);

app.listen(config[env].port);
console.log(msg.success('Listening on ' + config[env].port));