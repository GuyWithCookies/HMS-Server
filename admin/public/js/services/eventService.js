app.factory('EventService',  ['$q', '$timeout', '$http',  function ($q, $timeout, $http) {
    // return available functions for use in the controllers
    return ({
        getEvents: getEvents,
        getGpsPositions: getGpsPositions,
        generatePDFFile: generatePDFFile,
        getEmailSettings: getEmailSettings,
        setEmailSettings: setEmailSettings,
        setEvent: setEvent,
        removeEvent: removeEvent,
        removeDayEvents: removeDayEvents,
        updateEvent: updateEvent
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

    function removeEvent(id) {
        // create a new instance of deferred
        var deferred = $q.defer();
        // send a post request to the server
        console.log(id);
        $http.post('http://localhost:8081/event/remove',
            "id="+id,
            {headers: {'Content-Type': 'application/x-www-form-urlencoded'}})
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

    function setEvent(eventData) {

        // create a new instance of deferred
        var deferred = $q.defer();
        console.log("In Set Event in Service");
        console.log(eventData);
        // send a post request to the server
        $http.post('http://localhost:8081/event/set',
            "username="+eventData.username+"&title="+eventData.title+
            "&start="+eventData.start+"&end="+eventData.end+
            "&comment="+eventData.comment+"&activity="+eventData.activity+"&object="+eventData.object+"&type="+eventData.type,
            {headers: {'Content-Type': 'application/x-www-form-urlencoded'}})
        // handle success
            .success(function (data, status) {
                console.log(data);
                console.log(status);
                if(status === 200 && data.status === "OK"){
                    console.log("got success back");
                    deferred.resolve(data);
                } else {
                    deferred.reject(data.message);
                }
            })
            // handle error
            .error(function (data) {
                deferred.reject(data);
            });

        // return promise object
        return deferred.promise;
    }

    function removeDayEvents(date, username) {

        // create a new instance of deferred
        var deferred = $q.defer();
        console.log(date);
        console.log(username);
        // send a post request to the server
        $http.post('http://localhost:8081/event/removeDay',
            "username="+username+"&date="+date,
            {headers: {'Content-Type': 'application/x-www-form-urlencoded'}})
        // handle success
            .success(function (data, status) {
                console.log(status);
                if(status === 200 && data.status === "OK"){
                    deferred.resolve(data);
                } else {
                    deferred.reject(data);
                }
            })
            // handle error
            .error(function (data) {
                console.log(data);
                deferred.reject(data);
            });

        // return promise object
        return deferred.promise;
    }

    function updateEvent(eventData) {

        // create a new instance of deferred
        var deferred = $q.defer();
        console.log("In Update Event in Service");
        console.log(eventData);
        // send a post request to the server
        $http.post('http://localhost:8081/event/update',
            "username="+eventData.username+"&title="+eventData.title+
            "&start="+eventData.start+"&end="+eventData.end+
            "&comment="+eventData.comment+"&activity="+eventData.activity+"&object="+eventData.object+"&type="+eventData.type+
            "&id="+eventData._id,
            {headers: {'Content-Type': 'application/x-www-form-urlencoded'}})
        // handle success
            .success(function (data, status) {
                console.log(data);
                console.log(status);
                if(status === 200 && data.status === "OK"){
                    console.log("got success back");
                    deferred.resolve(data);
                } else {
                    deferred.reject(data.message);
                }
            })
            // handle error
            .error(function (data) {
                console.log(data);
                deferred.reject(data);
            });

        // return promise object
        return deferred.promise;
    }
}]);