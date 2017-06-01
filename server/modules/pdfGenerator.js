var fonts = {
    Roboto: {
        normal: 'fonts/Roboto-Regular.ttf',
        bold: 'fonts/Roboto-Medium.ttf',
        italics: 'fonts/Roboto-Italic.ttf',
        bolditalics: 'fonts/Roboto-MediumItalic.ttf'
    }
};

var PdfPrinter = require('pdfmake');
var printer = new PdfPrinter(fonts);
var fs = require('fs');
var moment = require('moment');
moment.locale('de');



var pdfGenerator = {
    generatePDF: function (docDefinition) {
        var pdfDoc = printer.createPdfKitDocument(docDefinition);
        var stream = fs.createWriteStream('temp/absolute.pdf');
        pdfDoc.pipe(stream);
        stream.on('error', function (err) {
            console.log(err);
        });
        pdfDoc.end();
    },

    generateContent: function (docData) {
        /*DocData has to contain
         -Forename, Username
         -relevant eventData
         -time range (date, range(y, m, w)
         */
        //test
        var docData = {
            forename: "Benjamin",
            username: "Schimke",
            timeRange: {
                range: "y",
                date: moment()
            },
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
        var count = {};
        var content = [];

        //Header
        content.push({text: 'Arbeitszeitnachweis für ' + docData.forename + " " + docData.username, style: 'header'});
        //Timedata
        var time = docData.timeRange;
        switch (time.range) {
            case "y":
            case "year":
                content.push({text: 'Jahr: ' + moment(time.date).year()});
                count.startWeek = 0;
                count.weeks = moment(time.date).weeksInYear();
                break;
            case "m":
            case "month":
                content.push({text: 'Monat: ' + moment(time.date).format('MMMM')});
                content.push({text: 'Jahr: ' + moment(time.date).year()});
                count.startWeek = moment(time.date).startOf('month').week();
                //Add one to get the last days
                count.weeks = moment(time.date).add(1, "month").startOf('month').week() - count.startWeek + 1;
                break;
            case "w":
            case "week":
                var weekNumber = moment(time.date).week();
                var beginningOfWeek = moment().week(weekNumber).startOf('week');
                //just working days?
                var endOfWeek = moment().week(weekNumber).startOf('week').add(6, 'days');
                content.push({
                    text: 'Woche ' + weekNumber +
                    ' vom ' + beginningOfWeek.format("DD") + " " + beginningOfWeek.format("MMMM") +
                    ' bis ' + endOfWeek.format("DD") + " " + endOfWeek.format("MMMM") + Array(120).join(" ") +
                    'Jahr: ' + moment(time.date).year()
                });

                count.startWeek = weekNumber;
                count.weeks = 1;
                break;
        }
        console.log(count);
        //TimeTable

        //First sort the events by week
        var sortedEvents = {};

        for (var event in docData.events){
            if (docData.events.hasOwnProperty(event)) {
                console.log(moment(docData.events[event].startsAt*1000).toISOString());
                var number = moment(docData.events[event].startsAt*1000).week();
                if(!sortedEvents.hasOwnProperty(number)){
                    sortedEvents[number] = []
                }
                sortedEvents[number].push(docData.events[event]);
            }
        }

        //now sort by date
        for (var week in sortedEvents) {
            if (sortedEvents.hasOwnProperty(week)) {
                sortedEvents[week]= sortedEvents[week].sort(function (a, b) {
                    return a.startsAt - b.startsAt;
                })
            }
        }
        //now sort by weekday
        for (var day in sortedEvents[week]) {
            if (sortedEvents[week].hasOwnProperty(week)) {
                sortedEvents[week]= sortedEvents[week].sort(function (a, b) {
                    return a.startsAt - b.startsAt;
                })
            }
        }
        console.log(sortedEvents);
        //Generate 1 Table for every Week
        for(var week=count.startWeek; week<count.weeks+count.startWeek; week++) {

            if(!sortedEvents.hasOwnProperty(week)){
                continue;
            }
            var body = [
                //HeaderColumns
                [
                    {text: 'Wochentag', style: 'tableHeader', alignment: 'center'},
                    {text: 'Objekt', style: 'tableHeader', alignment: 'center'},
                    {text: 'Tätigkeit', style: 'tableHeader', alignment: 'center'},
                    {text: 'Bemerkungen', style: 'tableHeader', alignment: 'center'},
                    {text: 'Arbeitsbeginn', style: 'tableHeader', alignment: 'center'},
                    {text: 'Arbeitsende', style: 'tableHeader', alignment: 'center'},
                    {text: 'Ist-AZ', style: 'tableHeader', alignment: 'center'},
                    {text: 'Pause', style: 'tableHeader', alignment: 'center'},
                    {text: 'GesamtStd', style: 'tableHeader', alignment: 'center'}]
            ];

            for(event in sortedEvents){
                if(sortedEvents.hasOwnProperty(event)){
                    var ev = sortedEvents[event];
                    body.push([
                        moment(ev.startsAt).weekday(),
                        ev.object,
                        ev.activity,
                        ev.comment,
                        moment(ev.startsAt).format("hh:mm"),
                        moment(ev.endsAt).format("hh:mm"),

                    ])
                }
            }

            content.push({
                style: 'table',
                color: '#444',
                table: {
                    widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                    headerRows: 1,
                    body: body
                }
            });
        }
        console.log(content);
        return content;
    },

    defaultDefinition: {
        content: [
            {text: 'Arbeitszeitnachweis', style: 'header'},
            'Official documentation is in progress, this document is just a glimpse of what is possible with pdfmake and its layout engine.',
            {text: 'A simple table (no headers, no width specified, no spans, no styling)', style: 'subheader'},
            'The following table has nothing more than a body array',
            {
                style: 'tableExample',
                table: {
                    body: [
                        ['Column 1', 'Column 2', 'Column 3'],
                        ['One value goes here', 'Another one here', 'OK?']
                    ]
                }
            }
        ],
        pageOrientation: 'landscape',
        styles: {
            header: {
                fontSize: 18,
                bold: true,
                margin: [0, 0, 0, 10]
            },
            subheader: {
                fontSize: 16,
                bold: true,
                margin: [0, 10, 0, 5]
            },
            table: {
                margin: [0, 5, 0, 15]
            },
            tableHeader: {
                bold: true,
                fontSize: 13,
                color: 'black'
            }
        },
    }
};







module.exports = pdfGenerator;