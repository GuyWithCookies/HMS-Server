#!/usr/bin/env node

var debug = require('debug')('passport-mongo');
var app = require('./app');
var pdfGenerator = require('./modules/pdfGenerator.js');
var moment = require("moment");

app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.set('ip', process.env.OPENSHIFT_NODEJS_IP || 'localhost');

var server = app.listen(app.get('port'), app.get("ip"), function() {
    console.log("Express server listening on port " + server.address().port);
    debug('Express server listening on port ' + server.address().port);
    console.log("pdfTest");

    var docData = {
        forename: "Benjamin",
        username: "Schimke",
        timeRange: {
            range: "m",
            date: moment()
        },
        coverSheet:true,
        events: [
            { _id: "5906daf2618d2915748d80e6",
                title: 'Blabla',
                startsAt: 1493524800,
                endsAt: 1493542800,
                username: 'Schimke',
                comment: 'qwewqewqeq',
                object: 'Blabla',
                activity: 'qewqewq',
                type: 'morning',
                __v: 0 },
            { _id: "5906daf2618d2915748d80e7",
                title: 'undefined',
                startsAt: 1493542800,
                endsAt: 1493550000,
                username: 'Schimke',
                comment: 'undefined',
                object: 'undefined',
                activity: 'undefined',
                type: 'break',
                __v: 0 },
            { _id: "5906daf2618d2915748d80e8",
                title: 'Blabla',
                startsAt: 1493550000,
                endsAt: 1493564400,
                username: 'Schimke',
                comment: 'qwewqewqeq',
                object: 'Blabla',
                activity: 'qewqewq',
                type: 'afternoon',
                __v: 0 },
            { _id: "590a27cb224e9c5e9f224b5f",
                title: 'asdf',
                startsAt: 1493784000,
                endsAt: 1493798400,
                username: 'Schimke',
                comment: 'asdf',
                object: 'asdf',
                activity: 'asdf',
                type: 'morning',
                __v: 0 },
            { _id: "590a27cb224e9c5e9f224b60",
                title: 'undefined',
                startsAt: 1493798400,
                endsAt: 1493809200,
                username: 'Schimke',
                comment: 'undefined',
                object: 'undefined',
                activity: 'undefined',
                type: 'break',
                __v: 0 },
            { _id: "590a27cb224e9c5e9f224b61",
                title: 'asdf',
                startsAt: 1493809200,
                endsAt: 1493820000,
                username: 'Schimke',
                comment: 'asdf',
                object: 'asdf',
                activity: 'asdf',
                type: 'afternoon',
                __v: 0 },
            { _id: "590b56e7224e9c5e9f224b62",
                title: 'Test',
                startsAt: 1493870400,
                endsAt: 1493892000,
                username: 'Schimke',
                comment: 'Nocsh ein Test',
                object: 'Test',
                activity: 'Test',
                type: 'morning',
                __v: 0 },
            { _id: "590b56e7224e9c5e9f224b63",
                title: 'Pause',
                startsAt: 1493892000,
                endsAt: 1493895600,
                username: 'Schimke',
                comment: 'undefined',
                object: 'undefined',
                activity: 'undefined',
                type: 'break',
                __v: 0 },
            { _id: "590b56e7224e9c5e9f224b64",
                title: 'Test',
                startsAt: 1493895600,
                endsAt: 1493906400,
                username: 'Schimke',
                comment: 'Noch ein Test',
                object: 'Test',
                activity: 'Testd',
                type: 'afternoon',
                __v: 0 } ]
    };

    var content = pdfGenerator.generateContent(docData);
    var definition = pdfGenerator.defaultDefinition;

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

    pdfGenerator.generatePDF(definition);
    console.log("Done");
});