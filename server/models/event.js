// event model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Event = new Schema({
    title: String,
    startsAt: Number,
    endsAt: Number,
    username: String,
    comment: String,
    object: String,
    activity: String,
    type: String
});

module.exports = mongoose.model('events', Event);
