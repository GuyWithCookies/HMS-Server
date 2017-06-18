var fs = require('fs');
var moment = require('moment');
var nodemailer = require("nodemailer");
var zipFolder = require("zip-folder");
var rimraf = require("rimraf");

var Event = require('../models/event.js');
var User = require('../models/user.js');

var emailSettings = require("../settings/emailSettings.json");
var pdfGenerator = require('../modules/pdfGenerator.js');

moment.locale('de');


var transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 465,
    secure: true, // secure:true for port 465, secure:false for port 587
    auth: {
        user: 'benjamin.schimke95@gmail.com',
        pass: '@Benjamin!1'
    }
});

var MailSender =  {
    sendSingleMail: function (data, cb) {
        //continue with sending reg mail
        var mailOptions = {
            from: 'bot@bot.com',
            to: data.email,
            //TODO add timedescription
            subject: 'Arbeitszeitnachweis für '+data.forename+" "+data.username,
            html: '<p>Arbeitszeitnachweis für '+data.forename+' '+data.username+'</p>',
            attachments: [{
                filename: 'Arbeitszeitnachweis_'+data.forename+"_"+data.username,
                path: '../admin/public/pdf/Arbeitszeitnachweis.pdf',
                contentType: 'application/pdf'
            }]
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
                cb()
            }
        });
    },

    sendRegMail: function () {
        this.generateUserDataArchiv(function () {
            var mailOptions = {
                from: 'bot@bot.com',
                to: emailSettings.email,
                //TODO add timedescription
                subject: 'Arbeitszeitnachweise',
                html: '<h1>Arbeitszeitnachweise</h1>',
                attachments: [{
                    filename: 'Arbeitszeitnachweise',
                    path: '../admin/public/pdf/Arbeitszeitnachweise.zip',
                    contentType: 'application/zip'
                }]
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
        });
    },

    generateUserDataArchiv: function (cb) {
        //get all users
        var users = emailSettings.users;
        var donePDFs = 0;
        console.log(users);
        //make folder for archiv
        rimraf('../admin/public/pdf/Arbeitszeitnachweise', function () {
            if(!fs.existsSync("../admin/public/pdf/Arbeitszeitnachweise")) {
                fs.mkdirSync("../admin/public/pdf/Arbeitszeitnachweise");
            }

            for(var user in users) {
                if (users.hasOwnProperty(user)) {
                    //get all events for the user
                    User.find({
                        username: users[user]
                    }, function(err, usersData) {
                        if (err) {
                            console.log(err);
                            return;
                        }

                        var userdata = usersData[0];
                        console.log(userdata);
                        Event.find({
                            "username": userdata.username
                        }, function (err, docs) {
                            if (err) {
                                console.log(err);
                                return;
                            }

                            var docData = {
                                forename: userdata.forename,
                                username: userdata.username,
                                timeRange: {
                                    range: emailSettings.range,
                                    date: moment()
                                }
                            };

                            Object.assign(docData, emailSettings);

                            docData.events = docs;
                            console.log("Generating PDF for "+docData.username+"...");
                            var content = pdfGenerator.generateContent(docData);
                            var definition = pdfGenerator.defaultDefinition;

                            if (!emailSettings.coverSheet) {
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
                            pdfGenerator.generatePDF(definition, "Arbeitszeitnachweise/"+docData.username+".pdf");

                            console.log("Done");
                            donePDFs++;
                            if(donePDFs===users.length){
                                zipFolder('../admin/public/pdf/Arbeitszeitnachweise', '../admin/public/pdf/Arbeitszeitnachweise.zip', function(err) {
                                    if(err) {
                                        console.log('oh no!', err);
                                    } else {
                                        console.log('EXCELLENT');
                                        cb();
                                    }
                                });
                            }
                        });
                    });
                }
            }
        });


    }
};

module.exports = MailSender;