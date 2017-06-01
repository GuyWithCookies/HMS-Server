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
        var count = {};
        var content = [];
        //cover sheet
        content.push({
            image:"../admin/public/img/logo.png",
            style:["logo","center"]
        });

        content.push({text: 'Arbeitszeitnachweis', style: ['center', 'header']});

        content.push({text: 'für ' + docData.forename + " " +
        docData.username, style: ['center', 'subheader']});

        //Timedata
        var time = docData.timeRange;
        switch (time.range) {
            case "y":
            case "year":
                content.push({text: moment(time.date).year(),  style: ['center', 'subheader']});
                count.startWeek = 0;
                count.weeks = moment(time.date).weeksInYear();
                break;
            case "m":
            case "month":
                content.push({
                    text: moment(time.date).format('MMMM')+" "+moment(time.date).year(),
                    style: ['center', 'subheader']
                });
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
                    ' bis ' + endOfWeek.format("DD") + " " + endOfWeek.format("MMMM"),
                    style: ['center', 'subheader']
                });

                content.push({
                    text: 'Jahr: ' + moment(time.date).year(),
                    style: ['center', 'subheader']
                });

                count.startWeek = weekNumber;
                count.weeks = 1;
                break;
        }

        content.push({text:'', pageBreak:"after", pageOrientation:"landscape"});


        //TimeTable
        //First sort the events by week
        var sortedEvents = {};

        for (var event in docData.events){
            if (docData.events.hasOwnProperty(event)) {
                var week = moment(docData.events[event].startsAt*1000).week();
                if(!sortedEvents.hasOwnProperty(week)){
                    sortedEvents[week] = {};
                }
                var weekday = moment(docData.events[event].startsAt*1000).format("dddd");
                if(!sortedEvents[week].hasOwnProperty(weekday)){
                    sortedEvents[week][weekday] = [];
                }
                sortedEvents[week][weekday].push(docData.events[event]);
            }
        }

        //now sort by date
        for (var week in sortedEvents) {
            if (sortedEvents.hasOwnProperty(week)) {
                for (var day in sortedEvents[week]) {
                    if (sortedEvents[week].hasOwnProperty(day)) {
                        sortedEvents[week][day] = sortedEvents[week][day].sort(function (a, b) {
                            return a.startsAt - b.startsAt;
                        })
                    }
                }
            }
        }

        //Generate 1 Table for every Week
        for(week=count.startWeek; week<count.weeks+count.startWeek; week++) {
            if(!sortedEvents.hasOwnProperty(week)){
                continue;
            }

            //add some description when month or year so we can identify the week
            if(time.range === "y" || time.range === "year" ||
                time.range === "m" || time.range === "month"){
                var beginningOfWeek = moment().week(week).startOf('week');
                var endOfWeek = moment().week(week).startOf('week').add(6, 'days');
                content.push({
                    text: 'Woche ' + week +
                    ' vom ' + beginningOfWeek.format("DD") + " " + beginningOfWeek.format("MMMM") +
                    ' bis ' + endOfWeek.format("DD") + " " + endOfWeek.format("MMMM"),
                    style: "subheader",
                    margin:[0, 0, 0, 25]
                });
            }

            var body = [
                //HeaderColumns
                [
                    {text: 'Wochentag', style: 'tableHeader', alignment: 'center'},
                    {text: 'Objekt', style: 'tableHeader', alignment: 'center'},
                    {text: 'Tätigkeit', style: 'tableHeader', alignment: 'center'},
                    {text: 'Bemerkungen', style: 'tableHeader', alignment: 'center'},
                    {text: 'Beginn', style: 'tableHeader', alignment: 'center'},
                    {text: 'Ende', style: 'tableHeader', alignment: 'center'},
                    {text: 'Ist-AZ', style: 'tableHeader', alignment: 'center'},
                    {text: 'Pause', style: 'tableHeader', alignment: 'center'},
                    {text: 'GesamtStd', style: 'tableHeader', alignment: 'center'}]
            ];

            for(var day in sortedEvents[week]){
                if(sortedEvents[week].hasOwnProperty(day)){
                    var day = sortedEvents[week][day];
                    var firstDay = true,
                        pause = {
                            hours:0,
                            minutes:0
                        };
                    var workSum = {
                        hours:0,
                        minutes:0
                    };

                    for(var event in day){
                        if(day.hasOwnProperty(event)){
                            var ev = day[event];
                            var diff =  moment((ev.endsAt-ev.startsAt)*1000).subtract(1, "hour");
                            weekday = firstDay ? {text:moment(ev.startsAt*1000).format("dddd"), rowSpan: Object.keys(day).length}:'';
                            firstDay = false;
                            if(ev.type === "break"){
                                pause["hours"]   += diff.hours();
                                pause["minutes"] += diff.minutes();
                                continue;
                            }else{
                                workSum["hours"]   += diff.hours();
                                workSum["minutes"] += diff.minutes();
                            }

                            body.push([
                                weekday,
                                ev.object,
                                ev.activity,
                                ev.comment,
                                {text:moment(ev.startsAt*1000).format("H:mm"), style:"center"},
                                {text:moment(ev.endsAt*1000).format("H:mm"), style:"center"},
                                {text:diff.format("H:mm"), style:"center"},
                                '',
                                ''
                            ])
                        }
                    }
                    //push the sum of pause and workinghours
                    body.push([
                        '',
                        '',
                        '',
                        '',
                        '',
                        '',
                        '',
                        {text:moment(pause).format("H:mm"), style:"center"},
                        {text:moment(workSum).format("H:mm"), style:"center"}
                    ])
                }
            }

            content.push({
                style: 'table',
                color: '#444',
                table: {
                    widths: ["10%", "15%", '20%', '20%', '7%', '7%', '7%', '7%', '7%'],
                    headerRows: 1,
                    body: body,
                },
                pageBreak:"after",

            });
        }
        return content;
    },

    defaultDefinition: {
        pageOrientation: 'portrait',
        styles: {
            header: {
                fontSize: 18,
                bold: true,
                underlined: true,
                margin: [0, 0, 0, 10]
            },
            subsubheader:{
                fontSize: 15,
                bold: true,
                italics: false,
                margin: [0, 10, 0, 0]
            },
            subheader: {
                fontSize: 13,
                bold: false,
                italics: true,
                margin: [0, 10, 0, 5]
            },
            table: {
                margin: [0, 5, 0, 15]
            },
            tableHeader: {
                bold: true,
                fontSize: 13,
                color: 'black'
            },
            logo:{
                margin: [0, 50, 15, 25]
            },
            center:{
                alignment: 'center'
            }
        }
    }
};







module.exports = pdfGenerator;