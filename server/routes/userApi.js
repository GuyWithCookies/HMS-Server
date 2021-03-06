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
        function(err) {
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
                        console.log("Login successfull");
                        return res.status(200).json({
                            status: "Login successful!",
                            user: docs[0]
                        })
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
                console.warn("Login error for user "+user.username);
                console.warn(err);
                return res.status(500).json({
                    err: 'Fehler beim Einloggen'
                });
            }
            console.log("Login successful for User:"+user.username);
            return res.status(200).json({
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

router.post('/status', function(req, res) {
    if(req.user) {
        console.log("User authenticated");
        res.status(200).json({
            status: true
        });
    }else {
        console.log("User not authenticated");
        return res.status(401).json({
            error: 'User not authenticated'
        });
    }


});

router.get('/status', function(req, res) {
    if(req.user) {
        console.log("User authenticated");
        res.status(200).json({
            status: true
        });
    }else {
        console.log("User not authenticated");
        return res.status(401).json({
            error: 'User not authenticated'
        });
    }


});

router.get("/getCurrentUser", function(req, res) {
    console.log(req);
    console.log("Get Current User Request. Send "+req.user);
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
        "username": data.oldUsername
    }, function(err, docs) {
        if (err) {
            res.json({
                status: "ERROR",
                msg: err
            });
        }
        if (docs.length > 0) {
            for(var key in data){
                if(!key.indexOf("Password")>-1 && !key.indexOf("old")>-1) {
                    if (data.hasOwnProperty(key) && data[key]!==null) {
                        docs[0][key] = data[key]
                    }
                }
            }
            //change Password
            if(data["oldPassword"] !== data["newPassword"] && data["oldPassword"] !== null
            && data["newPassword"] !== null){
                docs[0].changePassword(data["oldPassword"], data["newPassword"], function (err) {
                    if (err) {
                        console.log(err);
                        res.json({
                            status: "ERROR",
                            msg: err
                        });
                    }else {
                        console.log(docs[0]);
                        docs[0].save();
                        res.json({status:"OK"});
                    }
                });
            }else{
                docs[0].save();
                res.json({status:"OK"});
            }
        } else {
            console.log("Cant find user "+data.oldUsername);
        }
    })
});

/**
 * remove User from the database
 * @param name
 */
router.get("/removeUser/:name", function (req, res) {
    var name = req.params.name;
    console.log("Remove user:"+name);
    User.find({
        "username": name
    }, function(err, docs) {
        if (err) {
            console.log(err);
            res.status(500);
            res.json({
                status: "ERROR",
                msg: errs
            });
        }
        if (docs.length > 0) {
            console.log("Found User and remove him");
            docs[0].remove();
            res.json({
                status: "OK"
            })
        } else {
            console.log("Cant find user "+name);
            res.status(404);
            res.json({
                status: "ERROR",
                msg: "Dieser Mitarbeiter existiert nicht!"
            });
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
    //TODO
});


module.exports = router;