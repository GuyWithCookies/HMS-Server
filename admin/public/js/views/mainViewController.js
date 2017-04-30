app.controller('mainViewController', ['$scope', 'AuthService', 'EventService', 'moment',
    function($scope, AuthService, EventService, moment) {
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
                }
                $scope.events = events;
                console.log($scope.events);
            })
        };

        //start
        $scope.getUserList();
    }]);
