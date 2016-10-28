'use strict';

// cs142App.controller('LoginRegisterController', ['$scope', '$routeParams',
//   function ($scope, $routeParams) {
//     /*
//      * Since the route is specified as '/users/:userId' in $routeProvider config the
//      * $routeParams  should have the userId property set with the path from the URL.
//      */
//
//
//
//   }]);



  cs142App.controller("LoginRegisterController", function($scope, $location, $rootScope) {
    $scope.login = function() {
      $rootScope.loggedInUser = $scope.username;
      $location.path("/persons");
    };
  });
