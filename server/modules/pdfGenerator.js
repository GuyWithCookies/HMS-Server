var fonts = {
    Roboto: {
        normal: '../server/fonts/Roboto-Regular.ttf',
        bold: '../server/fonts/Roboto-Medium.ttf',
        italics: '../server/fonts/Roboto-Italic.ttf',
        bolditalics: '../server/fonts/Roboto-MediumItalic.ttf'
    }
};

var PdfPrinter = require('pdfmake');
var printer = new PdfPrinter(fonts);
var fs = require('fs');
var moment = require('moment');
moment.locale('de');



var pdfGenerator = {
    generatePDF: function (docDefinition, fileName, cb) {
        var pdfDoc = printer.createPdfKitDocument(docDefinition);
        var file = fileName || "Arbeitszeitnachweis.pdf";
        var filePath = "../admin/public/pdf/"+file;
        console.log(fileName);
        fs.closeSync(fs.openSync(filePath, 'w'));

        var stream = fs.createWriteStream(filePath);
        pdfDoc.pipe(stream);
        stream.on('error', function (err) {
            console.log(err);
        });
        pdfDoc.end();
        stream.on('finish', function () {
            // call the callback function or in my case resolve the Promise.
            if(typeof cb === 'function'){
                cb(fileName);
            }
        });
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
        if(docData.coverSheet) {
            content.push({
                image: "../admin/public/img/logo.png",
                style: ["logo", "center"]
            });

            content.push({text: 'Arbeitszeitnachweis', style: ['center', 'header']});

            content.push({
                text: 'für ' + docData.forename + " " +
                docData.username, style: ['center', 'subheader']
            });
        }

        //Timedata
        var time = docData.timeRange;
        switch (time.range) {
            case "y":
            case "year":
                if(docData.coverSheet) {
                    content.push({text: moment(time.date).year(), style: ['center', 'subheader']});
                }
                count.startWeek = 0;
                count.weeks = moment(time.date).weeksInYear();
                break;
            case "m":
            case "month":
                if(docData.coverSheet) {
                    content.push({
                        text: moment(time.date).format('MMMM') + " " + moment(time.date).year(),
                        style: ['center', 'subheader']
                    });
                }
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

                if(docData.coverSheet) {
                    content.push({
                        text: 'Woche ' + weekNumber +
                        ' vom ' + beginningOfWeek.format("DD") + "." + beginningOfWeek.format("MMMM") +
                        ' bis ' + endOfWeek.format("DD") + "." + endOfWeek.format("MMMM"),
                        style: ['center', 'subheader']
                    });

                    content.push({
                        text: 'Jahr: ' + moment(time.date).year(),
                        style: ['center', 'subheader']
                    });
                }
                count.startWeek = weekNumber;
                count.weeks = 1;
                break;
        }

        if(docData.coverSheet) {
            content.push({text: '', pageBreak: "after", pageOrientation: "landscape"});
        }


        //TimeTable
        //First sort and filter the events by week
        var sortedEvents = {};

        for (var event in docData.events){
            if (docData.events.hasOwnProperty(event)) {
                //workaround --> "m" not recognized by moment
                var range = docData.timeRange.range==="m"?"month":docData.timeRange.range;
                    //range = docData.timeRange.range==="w"?"week":docData.timeRange.range;
                if(!moment(docData.events[event].startsAt*1000)
                        .isSame(docData.timeRange.date, range)){
                    continue;
                }
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
        var summaryData = {};
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

            function ReverseObject(Obj){
                var reversed = {};
                var tempKey = [];
                var tempVal = [];

                for (var key in Obj){
                    if(Obj.hasOwnProperty(key)) {
                        tempKey.push(key);
                        tempVal.push(Obj[key]);
                    }
                }
                for (var i = tempKey.length-1; i >= 0; i--){
                    reversed[tempKey[i]] = tempVal[i];
                }
                return reversed;
            }

            sortedEvents[week] = ReverseObject(sortedEvents[week]);

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
                            weekday = firstDay ? {text:moment(ev.startsAt*1000).format("dddd")}:'';
                            //TODO Fix RowSpan Bug --> Right now just workaround (rowSpan: Object.keys(day).length-1 )
                            firstDay = false;

                            //add some summarycalculations
                            var mom = moment(ev.startsAt*1000);
                            var hours = mom.hours();
                            var year = mom.format("Y");
                            var month = mom.format("MMMM");

                            //sort the summarydata yearly and monthly so we can filter it later
                            if(!summaryData.hasOwnProperty(year)){
                                summaryData[year] = {};
                                summaryData[year].workSum = {
                                    days:0,
                                    hours:0,
                                    minutes:0
                                };
                                summaryData[year].pauseSum = {
                                    hours:0,
                                    minutes:0
                                };
                            }

                            if(!summaryData[year].hasOwnProperty(month)){
                                summaryData[year][month] = {};
                                summaryData[year][month].workSum = {
                                    days:0,
                                    hours:0,
                                    minutes:0
                                };
                                summaryData[year][month].pauseSum = {
                                    hours:0,
                                    minutes:0
                                };
                            }

                            if(ev.type === "break"){
                                pause["hours"]   += diff.hours();
                                pause["minutes"] += diff.minutes();

                                summaryData[year].pauseSum.hours += diff.hours();
                                summaryData[year].pauseSum.minutes += diff.minutes();

                                summaryData[year][month].pauseSum.hours += diff.hours();
                                summaryData[year][month].pauseSum.minutes += diff.minutes();
                                continue;
                            }else{
                                workSum["hours"]   += diff.hours();
                                workSum["minutes"] += diff.minutes();

                                summaryData[year].workSum.hours += diff.hours();
                                summaryData[year].workSum.minutes += diff.minutes();

                                summaryData[year][month].workSum.hours += diff.hours();
                                summaryData[year][month].workSum.minutes += diff.minutes();
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

                    summaryData[year].workSum.days ++;
                    summaryData[year][month].workSum.days ++;

                    //push the sum of pause and workinghours
                    body.push([
                        '',
                        '',
                        '',
                        '',
                        '',
                        '',
                        '',
                        {text:moment().hours(pause.hours).minutes(pause.minutes).format("H:mm"), style:"center"},
                        {text:moment().hours(workSum.hours).minutes(workSum.minutes).format("H:mm"), style:"center"}
                    ])
                }
            }

            content.push({
                style: 'table',
                color: '#444',
                table: {
                    widths: ["10%", "15%", '20%', '20%', '7%', '7%', '7%', '7%', '7%'],
                    headerRows: 1,
                    body: body
                },
                pageBreak:"after"
            });
        }

        var summaryContent = [];
        if(docData.summary){
            switch (docData.timeRange.range){
                case "w":
                    //Dont need summary ?
                    break;
                case "m":
                case "y":
                    content.push({
                        text: "Zusammenfassung",
                        style: ["header", "center"]
                    });
                    if(Object.keys(summaryData).length>0) {
                        summaryContent.push([
                            {text:"Monat|Jahr", style: 'tableHeader', alignment: 'center'},
                            {text:"Gesamtarbeitszeit", style: 'tableHeader', alignment: 'center'},
                            {text:"Gesamtpausenzeit", style: 'tableHeader', alignment: 'center'},
                            {text:"Arbeitstage", style: 'tableHeader', alignment: 'center'}
                        ]);

                        for (var y in summaryData) {
                            if (summaryData.hasOwnProperty(y)) {
                                content.push({
                                    text:y,
                                    style:"subheader"
                                });
                                //ignore some keys
                                if (!(y === "workSum" || y === "pauseSum")) {

                                    for (var m in summaryData[y]) {
                                        if (summaryData[y].hasOwnProperty(m)) {
                                            //ignore some keys
                                            if (!(m === "workSum" || m === "pauseSum")) {
                                                //short reference for the month object
                                                var mShort = summaryData[y][m];
                                                mShort.workSum.hours += Math.floor(mShort.workSum.minutes/60);
                                                mShort.workSum.minutes = mShort.workSum.minutes % 60;
                                                mShort.pauseSum.hours += Math.floor(mShort.pauseSum.minutes/60);
                                                mShort.pauseSum.minutes = mShort.pauseSum.minutes % 60;
                                                summaryContent.push([
                                                    {text:m, style:"center"},
                                                    {
                                                        text: mShort.workSum.hours+
                                                        ":" +
                                                        ("00"+mShort.workSum.minutes).substr(-2),
                                                        style:"center"
                                                    },
                                                    {
                                                        text: mShort.pauseSum.hours+
                                                        ":" +
                                                        ("00"+mShort.pauseSum.minutes).substr(-2),
                                                        style:"center"
                                                    },
                                                    {
                                                        text: mShort.workSum.days,
                                                        style: "center"
                                                    }

                                                ])
                                            }
                                        }
                                    }
                                }

                                //Gesamtjahr
                                summaryData[y].workSum.hours += Math.floor(summaryData[y].workSum.minutes/60);
                                summaryData[y].workSum.minutes = summaryData[y].workSum.minutes % 60;
                                summaryData[y].pauseSum.hours += Math.floor(summaryData[y].pauseSum.minutes/60);
                                summaryData[y].pauseSum.minutes = summaryData[y].pauseSum.minutes % 60;
                                summaryContent.push([
                                    {text: y+" Gesamt", style:"center"},
                                    {
                                        text: (summaryData[y].workSum.hours)+
                                        ":" +
                                        ("00"+summaryData[y].workSum.minutes).substr(-2),
                                        style:"center"
                                    },
                                    {
                                        text: (summaryData[y].pauseSum.hours)+
                                        ":" +
                                        ("00"+summaryData[y].pauseSum.minutes).substr(-2),
                                        style:"center"
                                    },
                                    {
                                        text: summaryData[y].workSum.days,
                                        style: "center"
                                    }

                                ])
                            }
                        }

                        content.push({
                            style: 'table',
                            color: '#444',
                            table: {
                                widths:["25%", "25%", "25%", "25%"],
                                headerRows: 1,
                                body: summaryContent
                            },
                            pageBreak:"after"
                        });
                    }else{
                        console.log("No Events for "+docData.username+" found");
                    }
                    break;
                default:
                    console.log("dont know range: "+docData.timeRange.range);
            }
        }
        //remove the last blank page
        content[content.length-1].pageBreak = null;
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
                width:"100%",
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