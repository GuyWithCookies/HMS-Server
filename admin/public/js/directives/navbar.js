app.directive("navbar", ["$location", "AuthService", function($location, AuthService) {
    return {
        restrict: "E",
        scope: {
        },
        replace: true,
        templateUrl: "templates/navbarTemplate.html",
        controller: function($scope) {
            AuthService.getCurrentUser().then(function (username) {
                AuthService.getUserData(username).then(function (userdata) {
                    $scope.name = "HMS Günther";

                    $scope.homeLink = "#/main";
                    $scope.views = userdata.admin ? [
                        {
                            'link': "#/main",
                            'text': "Kalender"
                        },
                        {
                            'link': "#/register",
                            'text': "Neuer Mitarbeiter",
                            'symbol': 'user'
                        },
                        {
                            'link': "#/emailSettings",
                            'text': "E-Mail Einstellungen",
                        }] : [];



                    $scope.logout = function() {

                        // call logout from service
                        AuthService.logout()
                            .then(function() {
                                $location.path('/login');
                            });
                    };

                    $scope.changeActiveTab = function(link) {
                        for (var view in $scope.views) {
                            if($scope.views.hasOwnProperty(view)) {
                                console.log($scope.views[view]);
                                if ($scope.views[view].link === link) {
                                    console.log("Active: " + link);
                                    $scope.views[view].active = true;
                                }
                                if ($scope.views[view].link !== link) {
                                    $scope.views[view].active = false;
                                }
                            }
                        }
                    };
                })
            })
        }
    }
}]);