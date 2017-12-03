app.controller('regularMailSettingsController',  ['$scope', '$location', "$timeout", 'EventService', 'AuthService',
    function ($scope, $location, $timeout, EventService, AuthService) {
        $scope.regMail = {
            users:[],
            sendDate:{
                date: new Date(),
                time: null
            }
        };
        $scope.errorMessage = null;
        $scope.successMessage = null;
        $scope.userList = [];
        $scope.datePicker = {
            options:{
                formatYear: 'yy',
                maxDate: new Date(2020, 5, 22),
                minDate: new Date(),
                startingDay: 1
            },
            opened: false
        };

        $scope.saveSettings = function () {
            console.log($scope.regMail);
            $scope.regMail.sendDate.date = moment($scope.datePicker.date).toISOString();
            EventService.setEmailSettings($scope.regMail).then(function (data) {
                console.log(data);
                $scope.successMessage = "Einstellungen wurden erfolgreich gespeichert!";
                $timeout(function () {
                    $scope.errorMessage = null;
                    $scope.successMessage = null;
                }, 4000)
            }, function () {
                $scope.errorMessage = "Während des Speicherns ist ein Fehler aufgetreten!";
                $timeout(function () {
                    $scope.errorMessage = null;
                    $scope.successMessage = null;
                }, 4000)
            })
        };

        $scope.userInList = function(username){
            for(var user in $scope.regMail.users) {
                if ($scope.regMail.users.hasOwnProperty(user)) {
                    if ($scope.regMail.users[user] === username) {
                        return true;
                    }
                }
            }
            return false;
        };

        $scope.toggleUser = function (username) {
            console.log(username);
            console.log($scope.regMail);
            if($scope.userInList(username)){
                $scope.regMail.users.splice($scope.regMail.users.indexOf(username), 1);
            }else{
                $scope.regMail.users.push(username);
            }
        };

        $scope.setFormat = function () {
            $scope.datePicker.format = $scope.regMail.range === "w" ? "EEEE" : "dd";
        };

        $scope.test = function () {
            console.log($scope.datePicker);
        }

        //Get Settings on call
        EventService.getEmailSettings().then(function (data) {
            $scope.regMail = data;
            $scope.datePicker.date = new Date(data.sendDate.date);

            $scope.setFormat();
            console.log($scope.regMail);
            AuthService.getAllUsers().then(function (userList) {
                console.log(userList);
                $scope.userList = userList;
            })
        });
    }]);

