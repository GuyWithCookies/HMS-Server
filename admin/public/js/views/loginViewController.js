app.controller('loginViewController', ['$scope', '$location', 'AuthService', function ($scope, $location, AuthService) {
    $scope.cred = {};

    $scope.login = function () {

      // initial values
      $scope.error = false;
      $scope.loading = true;

      // call login from service
      console.log($scope.cred.username);
      console.log($scope.cred.password);

      AuthService.login($scope.cred.username, $scope.cred.password)
        // handle success
        .then(function () {
          $location.path('/main');
          $scope.loading = false;
          $scope.login = {};
        })
        // handle error
        .catch(function () {
          $scope.error = true;
          $scope.errorMessage = "Falsche Name/Passwort Kombination oder du bist kein Admin";
          $scope.loading = false;
          $scope.login = {};
        });

    };

}]);
