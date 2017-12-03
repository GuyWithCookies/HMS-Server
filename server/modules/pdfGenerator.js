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
                image: "data:image/png;base64,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",
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