var express = require('express');
var router = express.Router();

var Event = require('../models/event.js');


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
        var events = docs;
        /*
         If performance goes down ?
         for(var i=0; i<docs.length; i++) {
         //if (docs[i].startsAt >= startsAt && docs[i].endsAt <= endsAt) {
         events.push(docs[i])
         //}
         }*/
        console.log(events);
        res.json({
            data: events,
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
        console.log(doc);
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

    console.log(req.body);

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
        if (err) return console.error(err);
        console.log("new Event saved:");
        console.log(event);
    });

    res.json({
        data: event,
        status: "OK"
    })

});

module.exports = router;