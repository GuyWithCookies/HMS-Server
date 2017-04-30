app.directive("navbar", ["$location", "AuthService", function($location, AuthService) {
    return {
        restrict: "E",
        scope: {
        },
        replace: true,
        templateUrl: "templates/navbarTemplate.html",
        controller: function($scope) {

            $scope.name = "Team Volleyball";

            $scope.homeLink = "#/main";
            $scope.views = [
                {
                    'link': "#/main",
                    'text': "Übersicht"
                },
                {
                    'link': "#/calendar?",
                    'text': "Kalender",
                    "symbol": "calendar"
                },
                {
                    'link': "#/register",
                    'text': "Neuer Mitarbeiter",
                    'symbol': 'user'
                }];



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
        }
    }
}]);