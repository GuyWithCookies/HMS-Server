// gps model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GpsPosition = new Schema({
    longitude: String,
    latitude: String,
    username: String,
    time: Number
});

module.exports = mongoose.model('gpsPositions', GpsPosition);