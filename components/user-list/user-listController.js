'use strict';


cs142App.controller('UserListController', ['$scope',
    function ($scope) {

        $scope.main.title = 'Users';

        // console.log('window.cs142models.userListModel()', window.cs142models.userListModel());
        // $scope.users = window.cs142models.userListModel();
        // console.log("FetchModel"+$scope.main.title);
        function listUpdate (users){
          // console.log("listUpdate");
          $scope.$apply(
            function(){
              $scope.users = users;
            }
          );
        }
        $scope.FetchModel("/user/list",listUpdate);
    }]);
