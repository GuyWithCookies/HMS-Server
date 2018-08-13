var express = require('express');
var router = express.Router();
var moment = require('moment');
var pdfGenerator = require('../modules/pdfGenerator.js');
var nodemailer = require('nodemailer');
var fs = require("fs");
var mailSender = require("../modules/mailSender");

var emailSettings = require("../settings/emailSettings.json");


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
        res.json({
            data: docs,
            status: "OK"
        })
    })
});

router.post('/getEmailSettings', function(req, res) {
    res.json({
        data: emailSettings,
        status: "OK"
    })
});

router.post('/setEmailSettings', function(req, res) {
    console.log(req.body.settings);
    emailSettings = req.body.settings;

    fs.writeFile('/home/benni/HMS-Server/server/settings/emailSettings.json', JSON.stringify(emailSettings, null, 4), function (err) {
        if (err) {
            throw err;
        }

        console.log('The file has been saved!');
    });

    res.json({
        data: emailSettings,
        status: "OK"
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
            if (moment(docs[i].startsAt*1000).isSame(date, "day")) {
                docs[i].remove();
            }
        }

        res.json({
            status: "OK"
        })
    })
});

router.post('/remove', function(req, res) {
    //date should be unix timestamp
    var id = req.body.id;

    Event.find({
        "_id": id
    }, function(err, docs) {
        if (err) {
            console.log(err);
            res.json({
                status: "ERROR",
                msg: err
            });
        }

        for(var i=0; i<docs.length; i++) {
                docs[i].remove();
        }
        console.log("Removed Event");
        res.json({
            status: "OK"
        })
    })
});

router.post('/saveGpsPosition', function(req, res) {
    var time = req.body.time;
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
                    pos:[parseFloat(docs[i].latitude),
                        parseFloat(docs[i].longitude)],
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

router.post("/generatePDFFile", function (req, res) {
    var docData = req.body.docData;
    console.log(docData);
    docData.timeRange.date  = moment(docData.timeRange.date, "DD.MM.YYYY");

    if(docData.all) {
        mailSender.sendRegMail(docData.email, docData.timeRange.date, docData.timeRange.range);
        res.json({status: "ok"});
    } else {
     
    console.log("Get Events for User...");

    Event.find({
        "username": docData.username
    }, function(err, docs) {
        if (err) {
            console.log(err);
            res.json({
                status: "ERROR",
                msg: err
            });
        }

        docData.events = docs;
        console.log("Generating PDF...");
        var content = pdfGenerator.generateContent(docData);
        var definition = pdfGenerator.defaultDefinition;

        if(!docData.coverSheet){
            definition.pageOrientation = "landscape";
        }

        definition["content"] = content;
        definition["footer"] = function (pagenumber, pagecount) {
            if (pagenumber === 1 && docData.coverSheet) {
                return {
                    columns: [
                        'erstellt am ' + moment().format("DD.MM.Y"),
                        {
                            alignment: "center",
                            text: [
                                {text: pagenumber.toString(), italics: true},
                                '/',
                                {text: pagecount.toString(), italics: true}
                            ]
                        },
                        {
                            alignment: 'right',
                            text: "©HMS Günther",
                            italics: true
                        }
                    ],
                    margin: [30, 0, 30, 0]
                };
            } else {
                return {
                    alignment: "center",
                    text: [
                        {text: pagenumber.toString(), italics: true},
                        '/',
                        {text: pagecount.toString(), italics: true}
                    ],
                    margin: [30, 0, 0, 30]
                };
            }
        };

        //saves generated pdf to temp/report.pdf
        pdfGenerator.generatePDF(definition, null, function () {
            if (docData.receiveType === "email") {
                //send mail
                mailSender.sendSingleMail(docData, function () {
                    res.json({status: "ok"});
                });
            } else if (docData.receiveType === "saveOnClient") {
                //send pdf back to client
                res.json({status: "ok"});
            } else {
                console.log("no receiveType specified");
                console.log(docData.receiveType);
            }
            console.log("Done");
        });
    });
  }
});

module.exports = router;
