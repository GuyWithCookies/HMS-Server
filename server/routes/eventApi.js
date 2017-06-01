var express = require('express');
var router = express.Router();
var moment = require('moment');

var Event = require('../models/event.js');
var GpsPosition = require('../models/gps.js');


router.post('/get', function(req, res) {
    //date should be unix timestamp
    var username;

    if(req.body.queryData) {
        var startsAt = parseInt(req.body.queryData.startsAt);
        var endsAt = parseInt(req.body.queryData.endsAt);
        username = req.body.queryData.username;
    }else{
        username = req.body.username
    }

    Event.find({
        "username": username
    }, function(err, docs) {
        if (err) {
            console.log(err);
            res.json({
                status: "ERROR",
                msg: err
            });
        }
        /*
         If performance goes down ?
         for(var i=0; i<docs.length; i++) {
         //if (docs[i].startsAt >= startsAt && docs[i].endsAt <= endsAt) {
         events.push(docs[i])
         //}
         }*/
        console.log(docs);
        res.json({
            data: docs,
            status: "OK"
        })
    })
});

router.post('/update', function(req, res) {
    var title = req.body.title;
    var startsAt = req.body.start;
    var endsAt = req.body.end;
    var username = req.body.username;
    var comment = req.body.comment;
    var object = req.body.object;
    var activity = req.body.activity;
    var type = req.body.type;
    var id = req.body.id;

    console.log(req.body);

    Event.findOne({"_id":id}, function(err, doc) {
        if (err) {
            console.log(err);
            res.json({
                status: "ERROR",
                msg: err
            });
        }

        doc.title = title;
        doc.startsAt = startsAt;
        doc.endsAt = endsAt;
        doc.username = username;
        doc.comment = comment;
        doc.object = object;
        doc.activity = activity;
        doc.type = type;
        console.log(doc);
        doc.save(function (err) {
            console.log(err);
            console.log("saved successfull");
            res.json({
                status: "OK"
            });
        });
    });
});

router.post('/set', function(req, res) {
    var title = req.body.title;
    var startsAt = req.body.start;
    var endsAt = req.body.end;
    var username = req.body.username;
    var comment = req.body.comment;
    var object = req.body.object;
    var activity = req.body.activity;
    var type = req.body.type;

    var event = new Event({
        title: title,
        startsAt: startsAt,
        endsAt: endsAt,
        username: username,
        comment:comment,
        object: object,
        activity: activity,
        type:type
    });

    event.save(function(err, event) {
        if (err) {
            console.log(err);
            res.json({
                data: event,
                status: "Error"
            });
        }
        res.json({
            data: event,
            status: "OK"
        })

    });
});

router.post('/removeDay', function(req, res) {
    //date should be unix timestamp
    var date = moment(req.body.date).toISOString();
    var username = req.body.username;
    console.log("Date :"+date);
    console.log(username);
    Event.find({
        "username": username
    }, function(err, docs) {
        if (err) {
            console.log(err);
            res.json({
                status: "ERROR",
                msg: err
            });
        }

        for(var i=0; i<docs.length; i++) {
            console.log(moment(docs[i].startsAt*1000).toISOString());
            console.log(moment(docs[i].startsAt*1000).isSame(date, "day"));
            if (moment(docs[i].startsAt*1000).isSame(date, "day")) {
                console.log("Remove");
                docs[i].remove();
            }
        }

        res.json({
            status: "OK"
        })
    })
});

router.post('/saveGpsPosition', function(req, res) {
    var time = moment(req.body.time).unix();
    var username = req.body.username;
    var longitude = req.body.long;
    var latitude = req.body.lat;

    var positionData = {
        time: time,
        username:username,
        longitude:longitude,
        latitude: latitude
    };

    var newPosition = new GpsPosition(positionData);
    newPosition.save(function (err, position) {
        if (err) {
            console.log(err);
            res.json({
                data: err,
                status: "Error"
            });
        }
        res.json({
            data: position,
            status: "OK"
        })
    });
});

router.post("/getGpsPositions", function (req, res) {
    //date should be unix timestamp
    var date = moment(req.body.date*1000);
    var username = req.body.username;

    GpsPosition.find({
        "username": username
    }, function(err, docs) {
        if (err) {
            console.log(err);
            res.json({
                status: "ERROR",
                msg: err
            });
        }

        var matchedPositions = [];

        for(var i=0; i<docs.length; i++) {
            if (moment(docs[i].time*1000).isSame(date, "day")) {
                matchedPositions.push({
                    pos:[parseFloat(docs[i].latitude)+ (Math.random()/10),
                        parseFloat(docs[i].longitude)+ (Math.random()/10)],
                    time:docs[i].time
                });
            }
        }

        res.json({
            status: "OK",
            positions: matchedPositions
        })
    })
});

module.exports = router;