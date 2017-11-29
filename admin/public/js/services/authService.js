app.factory('AuthService', ['$q', '$timeout', '$http', function($q, $timeout, $http) {

    // create user variable
    var user = null;

    // return available functions for use in the controllers
    return ({
        isLoggedIn: isLoggedIn,
        getUserStatus: getUserStatus,
        login: login,
        logout: logout,
        register: register,
        getCurrentUser: getCurrentUser,
        getUserData: getUserData,
        saveUserData: saveUserData,
        removeUser: removeUser,
        sendEmail: sendEmail,
        getAllUsers: getAllUsers
    });

    function isLoggedIn() {
       return user;
    }

    function getCurrentUser() {
        // create a new instance of deferred
        var deferred = $q.defer();

        // send a post request to the server
        $http.get('/user/getCurrentUser')
        // handle success
            .success(function(data, status) {
                if (status === 200) {
                    deferred.resolve(data.username);
                } else {
                    deferred.reject("Getting wrong status back: " + status);
                }
            })
            // handle error
            .error(function(data) {
                deferred.reject(data);
            });

        // return promise object
        return deferred.promise;
    }

    function getUserData(username) {
        // create a new instance of deferred
        var deferred = $q.defer();

        // send a post request to the server
        $http.get('/user/getUserData/' + username)
        // handle success
            .success(function(data, status) {
                if (status === 200) {
                    deferred.resolve(data.data);
                } else {
                    deferred.reject("Getting wrong status back: " + status);
                }
            })
            // handle error
            .error(function(data) {
                deferred.reject(data);
            });

        // return promise object
        return deferred.promise;
    }

    function getUserStatus() {
        return $http.get('/user/status')
        // handle success
            .success(function(data) {
                if (data.status) {
                    user = true;
                } else {
                    user = false;
                }
            })
            // handle error
            .error(function(data) {
                user = false;
            });
    }

    function login(username, password) {

        // create a new instance of deferred
        var deferred = $q.defer();
        // send a post request to the server
        $http.post('/user/adminLogin', {
            username: username,
            password: password
        })
        // handle success
            .success(function(data, status) {
                if (status === 200 && data.status) {
                    console.log("OK");
                    user = true;
                    deferred.resolve();
                } else {
                    user = false;
                    deferred.reject();
                }
            })
            // handle error
            .error(function(data) {
                user = false;
                deferred.reject();
            });

        // return promise object
        return deferred.promise;

    }

    function logout() {

        // create a new instance of deferred
        var deferred = $q.defer();

        // send a get request to the server
        $http.get('/user/logout')
        // handle success
            .success(function(data) {
                user = false;
                deferred.resolve();
            })
            // handle error
            .error(function(data) {
                user = false;
                deferred.reject();
            });

        // return promise object
        return deferred.promise;

    }

    function register(user) {

        // create a new instance of deferred
        var deferred = $q.defer();
        // send a post request to the server
        $http.post('/user/register', {
            username: user.username || "",
            password: user.password,
            forename: user.forename || "",
            surname: user.username || "",
            admin: user.admin || false
        })
        // handle success
            .success(function(data, status) {
                if (status === 200 && data.status) {
                    deferred.resolve();
                } else {
                    deferred.reject("Something went wrong with the Status: " + status + " " + data.status);
                }
            })
            // handle error
            .error(function(data) {
                deferred.reject(data);
            });

        // return promise object
        return deferred.promise;
    }

    function saveUserData(data) {

        // create a new instance of deferred
        var deferred = $q.defer();
        console.log(data);
        // send a post request to the server
        $http.post('/user/saveUserData', {
            userdata: data
        })
        // handle success
            .success(function(data, status) {
                if (status === 200 && data.status) {
                    deferred.resolve();
                } else {
                    deferred.reject("Something went wrong");
                }
            })
            // handle error
            .error(function(data) {
                deferred.reject(data);
            });

        // return promise object
        return deferred.promise;
    }

    /**
     * Sends request to remove the particular user from the database
     * @param name
     */
    function removeUser(name) {
        // create a new instance of deferred
        var deferred = $q.defer();
        console.log("Username to remove:"+name);
        // send a post request to the server
        $http.get('/user/removeUser/'+name)
        // handle success
            .success(function(data, status) {
                if (status === 200) {
                    deferred.resolve();
                } else {
                    deferred.reject(data);
                }
            })
            // handle error
            .error(function(data) {
                deferred.reject(data);
            });

        // return promise object
        return deferred.promise;
    }

    function sendEmail(data) {

        // create a new instance of deferred
        var deferred = $q.defer();
        console.log(data);
        // send a post request to the server
        $http.post('/user/sendEmail', {
            mailData: data
        })
        // handle success
            .success(function(data, status) {
                if (status === 200 && data.status) {
                    deferred.resolve();
                } else {
                    deferred.reject("Something went wrong");
                }
            })
            // handle error
            .error(function(data) {
                deferred.reject(data);
            });

        // return promise object
        return deferred.promise;
    }

    function getAllUsers() {

        // create a new instance of deferred
        var deferred = $q.defer();
        // send a post request to the server
        $http.get('/user/getAllUsers')
        // handle success
            .success(function(data, status) {
                console.log(data);
                if (status === 200 && data.status) {
                    deferred.resolve(data.userList);
                } else {
                    deferred.reject("Something went wrong");
                }
            })
            // handle error
            .error(function(data) {
                deferred.reject(data);
            });

        // return promise object
        return deferred.promise;
    }

}]);