var fs = require('fs');
var moment = require('moment');
var nodemailer = require("nodemailer");
var sgTransport = require("nodemailer-sendgrid-transport");
var zipFolder = require("zip-folder");
var rimraf = require("rimraf");

var Event = require('../models/event.js');
var User = require('../models/user.js');

var emailSettings = require("../settings/emailSettings.json");
var pdfGenerator = require('../modules/pdfGenerator.js');

moment.locale('de');

var options = {
    auth: {
        api_user: 'MyHMSSender',
        api_key: 'ML9sYSkSK6YjU4czQCq5TvxcHWLsKbgG'
    }

};

var transporter = nodemailer.createTransport(sgTransport(options));

var MailSender =  {
    sendSingleMail: function (data, cb) {
        //continue with sending reg mail
        var mailOptions = {
            from: 'HMSG_Sekretaer_Benni',
            to: data.email,
            subject: 'Arbeitszeitnachweis für '+data.forename+" "+data.username,
            html: '<h1>Arbeitszeitnachweis für '+data.forename+' '+data.username+'</h1>' +
            '<p>Öffne den Anhang um den Arbeitszeitnachweis herunterzuladen!</p><br>' +
            '                <p>Viele Grüße und einen schönen Tag,</p>'+
            '                <p><small>HMSG Sekretär Benni :-) </small></p>',
            attachments: [{
                filename: 'Arbeitszeitnachweis_'+data.forename+"_"+data.username+".pdf",
                path: '/home/benni/HMS-Server/admin/public/pdf/Arbeitszeitnachweis.pdf',
                contentType: 'application/pdf'
            }]
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent');
                cb()
            }
        });
    },

    sendRegMail: function (email=null, dat=null, range=null) {
	console.log(email)
	console.log(dat)
	console.log(range)
        this.generateUserDataArchiv(dat, range, function () {
            if (dat) {
		var dateString = moment(dat, "DD.MM.YYYY").format(MailSender.getDateFormat(range || emailSettings.range));
            } else {
                var dateString = moment().format(MailSender.getDateFormat(range || emailSettings.range));
            }

            var mailOptions = {
                from: 'HMSG_Sekretaer_Benni',
                to: email || emailSettings.email,
                //TODO add timedescription
                subject: 'Arbeitszeitnachweise für '+dateString,
                html: '<h1>Arbeitszeitnachweise</h1><p>Im Anhang befinden sich die Arbeitszeitnachweise für '+dateString+'</p><br>' +
                '<p>Viele Grüße und einen schönen Tag,</p>' +
                '<p><small>HMSG Sekretär Benni :-) </small></p>',
                attachments: [{
                    filename: 'Arbeitszeitnachweise_'+dateString+'.zip',
                    path: '/home/benni/HMS-Server/admin/public/pdf/Arbeitszeitnachweise.zip'
                }]
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent');
                }
            });
        });
    },

    generateUserDataArchiv: function (dat, range, cb) {
        //get all users
        var users = emailSettings.users;
        var donePDFs = 0;

        //make folder for archiv
        rimraf('/home/benni/HMS-Server/admin/public/pdf/Arbeitszeitnachweise', function () {
            if(!fs.existsSync("/home/benni/HMS-Server/admin/public/pdf/Arbeitszeitnachweise")) {
                fs.mkdirSync("/home/benni/HMS-Server/admin/public/pdf/Arbeitszeitnachweise");
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
                        //TODO Error if user doesnt exists
                        var userdata = usersData[0];
                        console.log(userdata);

                        if(userdata) {
                            Event.find({
                                "username": userdata.username
                            }, function (err, docs) {
                                if (err) {
                                    console.log(err);
                                    return;
                                }

				var myDate = dat ? moment(dat, "DD.MM.YYYY") : moment();
                                var docData = {
                                    forename: userdata.forename,
                                    username: userdata.username,
                                    timeRange: {
                                        range: range || emailSettings.range,
                                        date: myDate
                                    }
                                };

                                Object.assign(docData, emailSettings);

                                docData.events = docs;
                                console.log("Generating PDF for " + docData.username + "...");
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
                                pdfGenerator.generatePDF(definition, "Arbeitszeitnachweise/" + docData.username + ".pdf", function () {
                                    console.log("Done");
                                    donePDFs++;
                                    if (donePDFs === users.length) {
                                        zipFolder('/home/benni/HMS-Server/admin/public/pdf/Arbeitszeitnachweise', '/home/benni/HMS-Server/admin/public/pdf/Arbeitszeitnachweise.zip', function (err) {
                                            if (err) {
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
                    });
                }
            }
	});
    },

    /**
     * select a dateFormat String according to the set range
     * @param range y, m or w
     */
    getDateFormat: function (range) {
        if(range==="y"){
            return "YYYY";
        }else if(range === "m"){
            return "MMMM_YYYY"
        }else if(range==="w"){
            return "[Woche]_W_YYYY";
        }else{
            return "";
        }
    },

    /**
     * Checks if its time again to send the regular Mails
     * @returns {boolean}
     */
    isMailingTime: function () {
        delete require.cache[require.resolve('../settings/emailSettings.json')];
        emailSettings = require('../settings/emailSettings.json');

        var enabled = emailSettings.enable;
        var datetime = this.getTimeFromSettings();
        return (datetime.isSame(moment(), "minute") && enabled);
    },

    /**
     * calculates when the next time for an regmail sending occours.
     * Depends on the settings in emailSetting.json
     * @returns {*}
     */
    calculateNextMailingTime: function(){
        delete require.cache[require.resolve('../settings/emailSettings.json')];
        emailSettings = require('../settings/emailSettings.json');
        var datetime = this.getTimeFromSettings();
        var nextTime = null;

        switch (emailSettings.range){
            case "w":
                nextTime =  datetime.add(1, "week");
                break;
            case "m":
                nextTime = datetime.add(1, "month");
                break;
            case "d":
                nextTime = datetime.add(1, "year");
                break;
            default:
                return null;
        }

        emailSettings.sendDate.date = moment(nextTime).toISOString();
        emailSettings.sendDate.time = moment(nextTime).toISOString();
        fs.writeFile('/home/benni/HMS-Server/server/settings/emailSettings.json', JSON.stringify(emailSettings, null, 4), function (err) {
            if (err) throw err;
            console.log('The SettingsObj has been updated!');
        });
    },

    getTimeFromSettings: function () {
        delete require.cache[require.resolve('../settings/emailSettings.json')];

        var dateSettings = require('../settings/emailSettings.json').sendDate;
        var date = moment(dateSettings.date);
        var time = moment(dateSettings.time);

        return moment()
            .set("year", date.get("year"))
            .set("month", date.get("month"))
            .set("day", date.get("day"))
            .set("hour", time.get("hour"))
            .set("minute", time.get("minute"));
    }
};

module.exports = MailSender;
