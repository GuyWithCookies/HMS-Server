var express = require('express');
var router = express.Router();
var passport = require('passport');
var fs = require("fs");
var User = require('../models/user.js');


router.post('/register', function(req, res) {
    User.register(new User({
            username: req.body.username,
            forename: req.body.forename,
            surname: req.body.username,
            admin: req.body.admin
        }),
        req.body.password,
        function(err, account) {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    err: err
                });
            }
            passport.authenticate('local')(req, res, function() {
                return res.status(200).json({
                    status: 'Registration successful!'
                });
            });
        });
});

router.post('/adminLogin', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({
                err: info
            });
        }
        req.logIn(user, function(err) {
            if (err) {
                return res.status(500).json({
                    err: 'Fehler beim Einloggen'
                });
            }
            User.find({username:req.body.username}, function(err, docs) {
                if (err) {
                    return res.json({
                        status: "ERROR",
                        msg: err
                    });
                }
                if (docs.length > 0) {
                    console.log(docs[0]);
                    if(docs[0].admin) {
                        return res.status(200).json({
                            status: "Login successful!"
                        })
                    }else{
                        return res.status(401).json({
                            err: "Not an Admin!"
                        });
                    }
                } else {
                    console.log("Cant find any users");
                    return res.status(401).json({
                        err: "Cant find any users"
                    });
                }
            });
        });
    })(req, res, next);
});

router.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) {
            console.log(err);
            return next(err);
        }
        if (!user) {
            console.log("No User");
            return res.status(401).json({
                err: info
            });
        }
        req.logIn(user, function(err) {
            if (err) {
                console.warn("Login error for user "+user);
                console.warn(err);
                return res.status(500).json({
                    err: 'Fehler beim Einloggen'
                });
            }
            console.log("Login successful for User:"+user);
            res.status(200).json({
                status: 'Login successful!'
            });
        });
    })(req, res, next);
});

router.get('/logout', function(req, res) {
    req.logout();
    res.status(200).json({
        status: 'Bye!'
    });
});

router.get('/status', function(req, res) {
    if (!req.isAuthenticated()) {
        return res.status(200).json({
            status: false
        });
    }
    res.status(200).json({
        status: true
    });
});

router.get("/getCurrentUser", function(req, res) {
    console.log("Get Current User Request");
    console.log(req.user);
    if (req.user !== null) {
        res.json(req.user);
    }else{
        res.json(null);
    }
});

router.get("/getAllUsers", function(req, res) {
    User.find({}, function(err, docs) {
        if (err) {
                res.json({
                    status: "ERROR",
                    msg: errs
                });
        }
        if (docs.length > 0) {
            var userList = [];
            for(var doc in docs){
                if(docs.hasOwnProperty(doc)) {
                    userList.push(docs[doc]);
                }
            }
            res.json({
                status:"OK",
                userList: userList
            });
        } else {
            console.log("Cant find any users");
        }
    })
});

router.post("/saveUserData", function(req, res) {
    var data = req.body.userdata;
    User.find({
        "username": data.username
    }, function(err, docs) {
        if (err) {
            res.json({
                status: "ERROR",
                msg: errs
            });
        }
        if (docs.length > 0) {
            for(var key in data){
                if(data.hasOwnProperty(key)) {
                    docs[0][key] = data[key]
                }
            }
            docs[0].save();
            res.json({status:"OK"});
        } else {
            console.log("Cant find user "+name);
        }
    })
});

router.get("/getUserData/:name", function(req, res) {
    var name = req.params.name;
    User.find({
        "username": name
    }, function(err, docs) {
        if (err) {
            console.log(err);
            res.json({
                status: "ERROR",
                msg: errs
            });
        }
        if (docs.length > 0) {
            console.log("Found User and send Data");
            res.json({
                data: docs[0],
                status: "OK"
            })
        } else {
            console.log("Cant find user "+name);
        }
    })
});

router.post("/sendEmail", function (req, res) {

});


module.exports = router;