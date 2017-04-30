// dependencies
var express = require('express');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var mongoose = require('mongoose');
var hash = require('bcrypt-nodejs');
var path = require('path');
var passport = require('passport');
var localStrategy = require('passport-local' ).Strategy;


var connection_string = 'mongodb://localhost/hmsg';
// if OPENSHIFT env variables are present, use the available connection info:
if(process.env.OPENSHIFT_MONGODB_DB_URL){
    connection_string = process.env.OPENSHIFT_MONGODB_DB_URL+process.env.OPENSHIFT_APP_NAME;
}

mongoose.connect(connection_string);

// schema/models
var User = require('./models/user.js');
var Event = require('./models/event.js');


// create instance of express
var app = express();

// require userRoutes
var userRoutes = require('./routes/userApi.js');
var eventRoutes = require('./routes/eventApi.js');

//CORS middleware
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');

    next();
};

// define middleware
app.use(express.static(path.join(__dirname, '../admin/public')));
app.use(bodyParser.json());
//SEO Optimation
app.use(require('prerender-node').set('prerenderToken', 'VR1ZTJCYUfwQfCq27BRn'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie:{maxAge: 3600000*1000}
}));
app.use(allowCrossDomain);
app.use(passport.initialize());
app.use(passport.session());


// configure passport
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// routes
app.use('/user/', userRoutes);
app.use('/event/', eventRoutes);

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '../client/public/', 'index.html'));
});

// error handlers
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    console.log(req.path);
    err.status = 404;
    next(err);
});

app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.end(JSON.stringify({
        message: err.message,
        error: {}
    }));
});

module.exports = app;
