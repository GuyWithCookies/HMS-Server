app.factory('competitionsService',  ['$q', '$timeout', '$http',  function ($q, $timeout, $http) {
    // return available functions for use in the controllers
    return ({
        get:get,
        newComment: newComment,
        createOrUpdate:createOrUpdate
    });

    function get(id) {
        // create a new instance of deferred
        var deferred = $q.defer();
        var compID = id ? id : 'all';
        // send a post request to the server
        $http.post('/competition/get', {id: compID})
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

    function createOrUpdate(data) {
        // create a new instance of deferred
        var deferred = $q.defer();
        // send a post request to the server
        $http.post('/competition/newOrUpdate', {data: data})
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

    function newComment(username, data) {
        // create a new instance of deferred
        var deferred = $q.defer();
        console.log(username);
        console.log(data);
        // send a post request to the server
        $http.post('/competition/newComment',
            {username: username, "message": data.message, id: data.competitionID, "createDate":data.createDate})
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
