var mongoose = require('mongoose');

module.exports = function(config, msg){
    mongoose.connect(config[process.env].database, function(err){
        err ? console.log(msg.error(err)) : console.log(msg.success('Database server connection established.'));
    });
};