app.controller('mainViewController', ['$scope', 'AuthService', 'EventService',
    'moment', '$uibModal', "calendarConfig",
    function($scope, AuthService, EventService, moment, $uibModal, calendarConfig) {
        $scope.userList = {};

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
            console.log("blb");
           $scope.format = $scope.formats[$scope.view.calendarView];
        });
        //functions
        $scope.getUserList = function () {
            AuthService.getAllUsers().then(function (res) {
                console.log(res);
                $scope.userList = res;
                $scope.credSavePossible = false;
            })
        };

        //users...Array
        $scope.getEvents = function (username) {
            var startMoment = moment($scope.view.viewDate);
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
            console.log("Canceled timeout");
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
        console.log("in ShowTime");
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
            date: new Date()
        }
    };
    $pdf.username = user.username;
    $pdf.downloadable = false;
    $pdf.errorMessage = "";
    $pdf.loadingPDF = false;
    console.log($pdf.username);

    $pdf.generatePDF = function () {
        if($pdf.docData.timeRange.date !== "" && $pdf.docData.timeRange.date!==null) {
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
            $pdf.errorMessage = "Das Datumsfeld darf nicht leer sein! Bitte wähle einen Zeitraum."
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