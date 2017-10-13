#!/usr/bin/env node

var debug = require('debug')('passport-mongo');
var app = require('./app');


app.set('port', process.env.NODEJS_PORT || 8081);
app.set('ip', process.env.NODEJS_IP || 'localhost');

var server = app.listen(app.get('port'), app.get("ip"), function() {
    console.log("Express server listening on port " + server.address().port);
    debug('Express server listening on port ' + server.address().port);
});