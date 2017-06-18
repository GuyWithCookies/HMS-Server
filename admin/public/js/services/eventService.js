app.factory('EventService',  ['$q', '$timeout', '$http',  function ($q, $timeout, $http) {
    // return available functions for use in the controllers
    return ({
        getEvents: getEvents,
        getGpsPositions: getGpsPositions,
        generatePDFFile: generatePDFFile,
        getEmailSettings: getEmailSettings,
        setEmailSettings: setEmailSettings
    });

    function getEvents(queryData) {
        // create a new instance of deferred
        var deferred = $q.defer();
        // send a post request to the server
        $http.post('/event/get', {queryData: queryData})
        // handle success
            .success(function (data, status) {
                if(status === 200 && data.status){
                    deferred.resolve(data.data);
                } else {
                    deferred.reject();
                }
            })
            // handle error
            .error(function (data) {
                deferred.reject();
            });

        // return promise object
        return deferred.promise;
    }

    function getEmailSettings() {
        // create a new instance of deferred
        var deferred = $q.defer();
        // send a post request to the server
        $http.post('/event/getEmailSettings')
        // handle success
            .success(function (data, status) {
                if(status === 200 && data.status){
                    deferred.resolve(data.data);
                } else {
                    deferred.reject();
                }
            })
            // handle error
            .error(function (data) {
                deferred.reject();
            });

        // return promise object
        return deferred.promise;
    }

    function setEmailSettings(settings) {
        // create a new instance of deferred
        var deferred = $q.defer();
        // send a post request to the server
        $http.post('/event/setEmailSettings', {settings:settings})
        // handle success
            .success(function (data, status) {
                if(status === 200 && data.status){
                    deferred.resolve(data.data);
                } else {
                    deferred.reject();
                }
            })
            // handle error
            .error(function (data) {
                deferred.reject();
            });

        // return promise object
        return deferred.promise;
    }

    function generatePDFFile(docData) {
        // create a new instance of deferred
        var deferred = $q.defer();
        // send a post request to the server
        $http.post('/event/generatePDFFile', {docData: docData})
        // handle success
            .success(function (data, status) {
                if(status === 200 && data.status){
                    deferred.resolve(data.data);
                } else {
                    deferred.reject();
                }
            })
            // handle error
            .error(function (data) {
                deferred.reject();
            });

        // return promise object
        return deferred.promise;
    }

    function getGpsPositions(unixTimestamp, username) {
        // create a new instance of deferred
        var deferred = $q.defer();
        // send a post request to the server
        console.log(unixTimestamp);
        $http.post('/event/getGpsPositions', {
            date: unixTimestamp,
            username: username
        })
        // handle success
            .success(function (data, status) {
                if(status === 200 && data.status){
                    deferred.resolve(data.positions);
                } else {
                    deferred.reject();
                }
            })
            // handle error
            .error(function (data) {
                deferred.reject();
            });

        // return promise object
        return deferred.promise;
    }
}]);