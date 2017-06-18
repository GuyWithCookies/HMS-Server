app.controller('regularMailSettingsController',  ['$scope', '$location', "$timeout", 'EventService',
    function ($scope, $location, $timeout, EventService) {
        $scope.regMail = {};
        $scope.errorMessage = null;
        $scope.successMessage = null;

        //Get Settings on call
        EventService.getEmailSettings().then(function (data) {
            $scope.regMail = data;
            console.log(data);
        });

        $scope.saveSettings = function () {
            console.log($scope.regMail);
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

    }]);

