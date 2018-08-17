app.controller('mainViewController', ['$scope', 'AuthService', 'EventService',
    'moment', '$uibModal', "calendarConfig",
    function($scope, AuthService, EventService, moment, $uibModal, calendarConfig) {
        $scope.userList = {};
        $scope.userdata = null;

        //calendar stuff
        $scope.view = {};
        $scope.view.viewDate = new Date();
        $scope.view.calendarView = 'week';

        $scope.events = [];

        $scope.formats = {
            "day": "dd.MM.yyyy",
            "week": "Woc'h'e ww, yyyy",
            "month": "MMMM yyyy",
            "year": "yyyy"
        };
        $scope.format = $scope.formats[$scope.view.calendarView];
        $scope.$watch("view.calendarView", function(){
            $scope.format = $scope.formats[$scope.view.calendarView];
        });
        //functions
        $scope.getUserList = function () {
            AuthService.getCurrentUser().then(function (username) {
                AuthService.getUserData(username).then(function (userdata) {
                    $scope.userdata = userdata;

                    if (userdata.admin) {
                        AuthService.getAllUsers().then(function (res) {
                            console.log(res);
                            $scope.userList = res;
                            $scope.credSavePossible = false;
                        })
                    } else {
                        $scope.userList = [userdata];
                        $scope.credSavePossible = false;
                    }
                })
            })
        };

        //users...Array
        $scope.getEvents = function (username) {
            var startMoment = moment().subtract(7, "days");
            var queryData = {
                username: username,
                startsAt: startMoment.unix(),
                endsAt: startMoment.add(1, $scope.view.calendarView).unix()
            };

            EventService.getEvents(queryData).then(function (events) {
                console.log(events);
                for(var i=0; i<events.length; i++){
                    events[i].startsAt = new Date(moment.unix(events[i].startsAt).toDate());
                    events[i].endsAt = new Date(moment.unix(events[i].endsAt).toDate());
                    if(events[i].type === 'break'){
                        events[i]["color"] = calendarConfig.colorTypes.important;
                    }else{
                        events[i]["color"] = calendarConfig.colorTypes.info
                    }
                }
                $scope.events = events;
                console.log($scope.events);
            })
        };

        $scope.eventClicked = function (event) {
            console.log(event);
            $scope.view.calendarView = "day";
            $scope.view.viewDate = new Date(event.startsAt);
        };

        $scope.openMapModal = function (user) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'map.html',
                controller: 'ModalInstanceCtrl',
                controllerAs: '$ctrl',
                size: "lg",
                resolve: {
                    user: function () {
                        return user
                    }
                }
            });

            modalInstance.result.then(function (){
                console.log("Done");
            }, function () {
            });
        };

        $scope.openPDFModal = function (user) {
            console.log(user);
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'pdfGeneratorModal.html',
                controller: 'pdfModalInstanceCtrl',
                controllerAs: '$pdf',
                size: "lg",
                resolve: {
                    user: function () {
                        return user
                    }
                }
            });

            modalInstance.result.then(function (){
                console.log("Done");
            }, function () {
            });
        };

        $scope.openEventModal = function (user) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'addNewEvent.html',
                controller: 'eventModalInstanceCtrl',
                controllerAs: '$ev',
                size: "lg",
                resolve: {
                    user: function () {
                        return user
                    }
                }
            });

            modalInstance.result.then(function (){
                console.log("Done");
                $scope.getEvents($scope.userdata.username)
            }, function () {
            });
        };

        $scope.openChangeUserModal = function (user) {
            console.log(user);
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'changeUserModal.html',
                controller: 'changeUserModalInstanceCtrl',
                controllerAs: '$cuModal',
                size: "lg",
                resolve: {
                    user: function () {
                        return user
                    }
                }
            });

            modalInstance.result.then(function (){
                console.log("Done");
                $scope.getUserList();
            }, function () {
            });
        };

        //start
        $scope.getUserList();
    }]);


app.controller('ModalInstanceCtrl', function (NgMap, $uibModalInstance, $timeout, EventService, user) {
    var $ctrl = this;
    $ctrl.username = user.username;
    $ctrl.forename = user.forename;
    $ctrl.errorMessage = "";
    $ctrl.googleMapsUrl = "https://maps.googleapis.com/maps/api/js?key=AIzaSyCvU-yIIifuckW222Z2rZ82JkBy0-iBjZ4 ";
    console.log($ctrl.username);
    $ctrl.map = null;
    $ctrl.datepicker = {
        opened: false,
        date: new Date()
    };

    //need to resize on every opening so we wont get a grey screen(bug)
    NgMap.getMap().then(function(map) {
        var center = map.getCenter();
        google.maps.event.trigger(map, "resize");
        map.setCenter(center);
        $ctrl.map = map;
    });

    $ctrl.getGpsPositions = function () {
        $ctrl.errorMessage = "";
        try {
            $ctrl.timeout.cancel();
        }catch (e){}

        var timestamp = moment($ctrl.datepicker.date, "dd MMMM yyyy").unix();

        EventService.getGpsPositions(timestamp, $ctrl.username).then(function (positions) {
            console.log(positions);
            if(positions.length>0) {
                NgMap.getMap().then(function (map) {
                    var center = positions[0].pos;
                    map.setCenter(center);
                    $ctrl.positions = positions
                });
            }else{
                $ctrl.errorMessage = "Für diesen Tag sind keine Positionsdaten verzeichnet!";
                $ctrl.timeout = $timeout(function () {
                    $ctrl.errorMessage = "";
                }, 5000);
            }
        })
    };


    //TODO time for marker
    $ctrl.showTime = function(e, marker) {
        $ctrl.clickedMarker = marker;
        $ctrl.map.showInfoWindow('iw', marker._id);
    };

    $ctrl.hideTime = function() {
        console.log("in hideTime");
        $ctrl.map.hideInfoWindow('iw');
    };



    $ctrl.ok = function () {
        $uibModalInstance.close();
    };

    $ctrl.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    //get GPS of today at loading
    $ctrl.getGpsPositions();
});

app.controller('pdfModalInstanceCtrl', function ($uibModalInstance, EventService, user) {
    var $pdf = this;
    $pdf.docData = {
        username: user.username,
        forename: user.forename,
        receiveType: "saveOnClient",
        coverSheet: true,
        summary: true,
        timeRange:{
            range: "w",
            date: undefined
        },
        email:null,
        all: false
    };
    $pdf.username = user.username;
    $pdf.downloadable = false;
    $pdf.errorMessage = "";
    $pdf.loadingPDF = false;
    console.log($pdf.username);

    $pdf.generatePDF = function () {
        if($pdf.docData.timeRange.date !== "" && $pdf.docData.timeRange.date!==null) {
            if($pdf.docData.receiveType !== "email" || $pdf.docData.email!==null) {
                console.log($pdf.docData);
                $pdf.loadingPDF = true;
                $pdf.errorMessage = "";
                EventService.generatePDFFile($pdf.docData).then(function (response) {
                    console.log(response);
                    $pdf.loadingPDF = false;
                    if ($pdf.docData.receiveType === "saveOnClient") {
                        $pdf.downloadable = true;
                    } else {
                        $pdf.ok();
                    }
                })
            }else{
                $pdf.errorMessage = "Bitte gib eine E-Mail Addresse an, zu welcher der Arbeitsnachweis gesendet werden soll.";
                $pdf.loadingPDF = false;
            }
        }else{
            $pdf.errorMessage = "Das Datumsfeld darf nicht leer sein! Bitte wähle einen Zeitraum.";
            $pdf.loadingPDF = false;
        }
    };

    $pdf.datepicker = {
        opened: false,
        show: true
    };

    $pdf.rstBtn = function () {
        $pdf.downloadable = false;
    };

    $pdf.timeRangeChanged = function () {
        //reset button to generate if value changes
        $pdf.rstBtn();
        $pdf.datepicker.show = true;

        switch ($pdf.docData.timeRange.range){
            case "w":
                $pdf.datepicker.format = "'Woche' w, MMMM yyyy";
                break;
            case "m":
                $pdf.datepicker.format = "MMMM yyyy";
                break;
            case "y":
                $pdf.datepicker.format = "yyyy";
                break;
        }
    };

    $pdf.ok = function () {
        $uibModalInstance.close();
    };

    $pdf.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $pdf.timeRangeChanged();
});

app.controller('eventModalInstanceCtrl', function ($uibModalInstance, EventService, user) {
    var $ev = this;
    $ev.user = user;
    $ev.errorMessage = "";
    $ev.loading = false;
    $ev.day = {
        date: new Date(),
        objects: [{}],
        break: {}
    };
    console.log($ev.user.username);

    $ev.addEmptyObject = function () {
        $ev.day.objects.push({})
    };

    //create new Event on server
    $ev.setEvent = function (eventData) {
        EventService.setEvent(eventData).then(function (response) {
            console.log("Successfull created new Event");
            $ev.ok()
        }, function (error) {
            console.log(error);
        })
    };

    $ev.submitDay = function () {
        //submit
        var format = "H:mm";

        //check if event collides with pause --> make 2 events
        for(var obj in $ev.day.objects){
            if($ev.day.objects.hasOwnProperty(obj)){
                console.log($ev.day.objects[obj]);
                console.log($ev.day.break.start);
                if(moment($ev.day.break.start).isBetween(moment($ev.day.objects[obj].start)
                    , moment($ev.day.objects[obj].end))){
                    console.log("split");
                    var tempObj = $ev.day.objects[obj];
                    $ev.day.objects.splice(obj, 1);

                    var eventBeforePause = Object.assign({}, tempObj);
                    eventBeforePause.end = $ev.day.break.start;
                    $ev.day.objects.push(eventBeforePause);

                    var eventAfterPause = Object.assign({}, tempObj);
                    eventAfterPause.start = $ev.day.break.end;
                    $ev.day.objects.push(eventAfterPause);
                }else if(moment($ev.day.break.end).isBetween(moment($ev.day.objects[obj].start)
                    , moment($ev.day.objects[obj].end))){
                    console.log("also split");
                }
            }
        }
        for(var obj in $ev.day.objects) {
            if($ev.day.objects.hasOwnProperty(obj)) {
                var currObj = $ev.day.objects[obj];

                //check if event collides with pause time
                //if so --> make two events
                if(currObj.object && currObj.start && currObj.end){
                    $ev.setEvent({
                        title: currObj.object,
                        username: $ev.user.username,
                        start: moment($ev.day.date).startOf("day").add(currObj.start.getHours(), "hours")
                            .add(currObj.start.getMinutes(), "minutes").unix(),
                        end: moment($ev.day.date).startOf("day").add(currObj.end.getHours(), "hours")
                            .add(currObj.end.getMinutes(), "minutes").unix(),
                        comment: currObj.comment || "",
                        object: currObj.object || "",
                        activity: currObj.activity || "",
                        type: "object"
                    });
                }
            }
        }

        //break
        if($ev.day.break.start && $ev.day.break.end) {
            $ev.setEvent({
                title: "Pause",
                username: $ev.user.username,
                start: moment($ev.day.date).startOf("day").add($ev.day.break.start.getHours(), "hours")
                    .add($ev.day.break.start.getMinutes(), "minutes").unix(),
                end: moment($ev.day.date).startOf("day").add($ev.day.break.end.getHours(), "hours")
                    .add($ev.day.break.end.getMinutes(), "minutes").unix(),
                type: "break"
            });
        }
    };

    $ev.removeEvent = function (index) {
        $ev.day.objects.splice(index, 1)
    };

    $ev.timeRangeChanged = function () {
        //reset button to generate if value changes
        $ev.rstBtn();
        $ev.datepicker.show = true;

        switch ($ev.docData.timeRange.range){
            case "w":
                $ev.datepicker.format = "'Woche' w, MMMM yyyy";
                break;
            case "m":
                $ev.datepicker.format = "MMMM yyyy";
                break;
            case "y":
                $ev.datepicker.format = "yyyy";
                break;
        }
    };

    $ev.ok = function () {
        $uibModalInstance.close();
    };

    $ev.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});

app.controller('changeUserModalInstanceCtrl', function ($uibModalInstance, AuthService, user) {
    var $cuModal = this;
    console.log(user);
    $cuModal.user = user;
    $cuModal.username = user.username;
    $cuModal.newUserData ={
        oldUsername: user.username,
        username: user.username,
        forename: user.forename,
        surname: user.surname,
        admin: user.admin,
        oldPassword: null,
        newPassword: null
    };

    $cuModal.errorMessage = "";
    $cuModal.newPasswordCheck = null;
    $cuModal.loading = false;

    $cuModal.removeUser = function () {
        if(confirm("Möchtest du den Mitarbeiter wirklich löschen? Das kann nicht rückgängig gemacht werden!")) {
            $cuModal.loading = true;
            AuthService.removeUser($cuModal.username).then(function (response) {
                console.log(response);
                $cuModal.loading = false;
                $cuModal.ok();
            }, function (response) {
                $cuModal.loading = false;
                $cuModal.errorMessage = response.data.msg;
            })
        }
    };

    $cuModal.updateUserdata = function () {
        if($cuModal.newPasswordCheck === $cuModal.newUserData.newPassword) {
            $cuModal.loading = true;
            AuthService.saveUserData($cuModal.newUserData).then(function (response) {
                console.log(response);
                $cuModal.loading = false;
                $cuModal.ok();
            }, function (response) {
                $cuModal.loading = false;
                if(response) {
                    $cuModal.errorMessage = response.data.msg;
                }else {
                    $cuModal.errorMessage = "Irgendwas ist schief gelaufen! Bitte melde dich bei Benni."
                }
            })
        }else {
            $cuModal.errorMessage = "Die neuen Passwörter stimmen nicht überein!"
        }
    };

    $cuModal.ok = function () {
        $uibModalInstance.close();
    };

    $cuModal.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

});
