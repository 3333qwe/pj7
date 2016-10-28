'use strict';

cs142App.controller('UserPhotosController', ['$scope', '$routeParams',
    function($scope, $routeParams) {
        /*
         * Since the route is specified as '/photos/:userId' in $routeProvider config the
         * $routeParams  should have the userId property set with the path from the URL.
         */
        var userId = ($routeParams.userId);
        // console.log('UserPhoto of ', $routeParams.userId);

        $scope.FetchModel("/photosOfUser/" + userId, function(photos) {
            // console.log("listUpdate");
            // console.log("photos:" + photos);
            photos.forEach(function(photo) {
                // console.log(photo);
                photo.comments.forEach(function(comment) {
                    // console.log(comment.user);
                });
            });
            $scope.$apply(
                function() {
                    $scope.photos = photos;
                }
            );
        });
        // console.log('window.cs142models.photoOfUserModel($routeParams.userId)',
        //    window.cs142models.photoOfUserModel(userId));
        // $scope.photos =  window.cs142models.photoOfUserModel(userId);
    }
]);
