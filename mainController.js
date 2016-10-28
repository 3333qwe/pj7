'use strict';

var cs142App = angular.module('cs142App', ['ngRoute', 'ngMaterial', 'ngResource']);

var noOneIsLoggedIn = function() {
    return false;
};


cs142App.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/users', {
            templateUrl: 'components/user-list/user-listTemplate.html',
            controller: 'UserListController'
        }).
        when('/users/:userId', {
            templateUrl: 'components/user-detail/user-detailTemplate.html',
            controller: 'UserDetailController'
        }).
        when('/photos/:userId', {
            templateUrl: 'components/user-photos/user-photosTemplate.html',
            controller: 'UserPhotosController'
        }).
        when('/login-register', {
            templateUrl: 'components/login-register/login-registerTemplate.html',
            controller: 'LoginRegisterController'
        }).
        otherwise({
            redirectTo: '/'
        });
    }
])
.
run(function($rootScope, $location) {
    $rootScope.$on("$routeChangeStart", function(event, next, current) {
        console.log("rountchangeStart");

        console.log(event);
        if (!noOneIsLoggedIn()) {
            // no logged user, redirect to /login-register unless already there
            if (next.templateUrl !== "components/login-register/login-registerTemplate.html") {
                console.log("not login");
                console.log($location);




                $location.path("/login-register");
                console.log($location);
                $rootScope.location = $location;
            }
        }
    });
});

cs142App.controller('MainController', ['$scope', '$rootScope', '$location', '$resource', '$http',
    function($scope, $rootScope, $location, $resource, $http) {
        console.log("MainController");
        $scope.main = {
            title: 'Users'
        };


        /*
         * FetchModel - Fetch a model from the web server.
         *   url - string - The URL to issue the GET request.
         *   doneCallback - function - called with argument (model) when the
         *                  the GET request is done. The argument model is the object
         *                  containing the model. model is undefined in the error case.
         */
        $scope.FetchModel = function(url, doneCallback) {
            var xhr = new XMLHttpRequest();

            var xhrHandler = function() {
                // console.log(this);
                if (this.readyState !== 4) { // DONE
                    return;
                }
                if (this.status !== 200) { // OK
                    // Handle error ...
                    return;
                }
                var obj = JSON.parse(this.responseText);
                doneCallback(obj);
            };
            xhr.onreadystatechange = xhrHandler;
            xhr.open("GET", url);
            xhr.send();
            // console.log(doneCallback);
        };

        /* getVersion for toolbar
         */
        function getVersion(obj) {
            // console.log(obj["version"]);
            $scope.$apply(function() {
                // Put your code that updates any $scope variables here
                $scope.versionString = obj.version;
                // console.log(obj);
                // console.log($scope.versionString);
            });
            // return(obj["version"]);
        }
        $scope.FetchModel("/test/info", getVersion);
    }
]);
