var app = angular.module('app', ['ngRoute', "ui.bootstrap", "mwl.calendar", 'ngMap']);

app.config(["$routeProvider", "$logProvider", "calendarConfig", "moment",
function ($routeProvider, $logProvider, calendarConfig, moment){

    $routeProvider
    .when('/login', {
            templateUrl: '../templates/loginView.html',
            controller: 'loginViewController',
            access: {restricted: false}
        })
        .when('/logout', {
            controller: 'logoutController',
            access: {restricted: true}
        })
        .when('/register', {
            templateUrl: '../templates/registerView.html',
            controller: 'registerViewController',
            access: {restricted: false}
        })
        .when('/main', {
            templateUrl: '../templates/mainView.html',
            controller: 'mainViewController',
            access: {restricted: true}
        })
        .otherwise({
            redirectTo: '/login'
        });

    $logProvider.debugEnabled(true);


    moment.locale('de', {
        week: {
            dow: 1 // Monday is the first day of the week
        }
    });

    calendarConfig.dateFormatter = 'moment';

    calendarConfig.allDateFormats.moment.date.hour = 'HH:mm';

    // This will configure the day view title to be shorter
    calendarConfig.allDateFormats.moment.title.day = 'ddd D MMM';

    // This will set the week number hover label on the month view
    calendarConfig.i18nStrings.weekNumber = 'Woche {week}';

    // This will display all events on a month view even if they're not in the current month. Default false.
    calendarConfig.displayAllMonthEvents = true;
    calendarConfig.showTimesOnWeekView = true;
}]);

app.run(function ($rootScope, $location, $route, AuthService) {
    $rootScope.$on('$routeChangeStart',
        function (event, next, current) {
            AuthService.getUserStatus()
                .then(function(){
                    next.access = next.access || {};    
                    if (next.access.restricted && !AuthService.isLoggedIn()){
                        $location.path('/login');
                        $route.reload();
                    }
                });
        });
});
