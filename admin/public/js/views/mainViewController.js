app.controller('mainViewController', ['$scope', 'AuthService', 'EventService',
    'moment', '$uibModal',
    function($scope, AuthService, EventService, moment, $uibModal) {
        $scope.userList = {};

        //calendar stuff
        $scope.calendarView = 'week';

        $scope.viewDate = new Date();

        $scope.events = [];

        //functions
        $scope.getUserList = function () {
            AuthService.getAllUsers().then(function (res) {
                console.log(res);
                $scope.userList = res;      $scope.credSavePossible = false;

            })
        };

        //users...Array
        $scope.getEvents = function (username) {
            var startMoment = moment($scope.viewDate);
            var queryData = {
                username: username,
                startsAt: startMoment.unix(),
                endsAt: startMoment.add(1, $scope.calendarView).unix()
            };

            EventService.getEvents(queryData).then(function (events) {
                console.log(events);
                for(var i=0; i<events.length; i++){
                    events[i].startsAt = new Date(moment.unix(events[i].startsAt).toDate());
                    events[i].endsAt = new Date(moment.unix(events[i].endsAt).toDate());
                    if(events[i].type === 'break'){
                        events[i]["color"] = { // can also be calendarConfig.colorTypes.warning for shortcuts to the deprecated event types
                            primary: '#2a2c39', // the primary event color (should be darker than secondary)
                            secondary: '#00f87b' // the secondary event color (should be lighter than primary)
                        }
                    }else{
                        events[i]["color"] = { // can also be calendarConfig.colorTypes.warning for shortcuts to the deprecated event types
                            primary: '#000000', // the primary event color (should be darker than secondary)
                            secondary: '#2a2c39' // the secondary event color (should be lighter than primary)
                        }
                    }
                }
                $scope.events = events;
                console.log($scope.events);
            })
        };

        //TODO
        $scope.getMapData = function (username, day) {
            //wait till the api is ready
        };

        $scope.openMapModal = function (username) {
            console.log(username);
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'map.html',
                controller: 'ModalInstanceCtrl',
                controllerAs: '$ctrl',
                size: "lg",
                resolve: {
                    username: function () {
                        return username
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


app.controller('ModalInstanceCtrl', function (NgMap, $uibModalInstance, $timeout, EventService, username) {
    var $ctrl = this;
    $ctrl.username = username;
    $ctrl.errorMessage = "";
    $ctrl.googleMapsUrl = "https://maps.googleapis.com/maps/api/js?key=AIzaSyCvU-yIIifuckW222Z2rZ82JkBy0-iBjZ4 ";
    console.log($ctrl.username);
    $ctrl.map = null

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


    //TODO
    $ctrl.showTime = function(e, marker) {
        console.log("in ShowTime");
        $ctrl.clickedMarker = marker;
        $ctrl.map.showInfoWindow('iw', marker._id);
    };

    $ctrl.hideTime = function() {
        console.log("in hideTime");
        $ctrl.map.hideInfoWindow('iw');
    };

    $ctrl.datepicker = {
        opened: false,
        date: moment()
    };

    $ctrl.ok = function () {
        $uibModalInstance.close();
    };

    $ctrl.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});