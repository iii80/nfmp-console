/**
 * Sign In Controller
 */
angular.module('controllers').controller('signIn', ['$scope', '$timeout', '$state', '$http',
  function ($scope, $timeout, $state, $http) {
    'use strict';

    $scope.transmitting = false;
    $scope.password = '';
    $scope.autoSignIn = false;
    $scope.wrongPassword = false;
    $scope.key = '';

    function resetPassword () {
      $scope.wrongPassword = false;
    }

    $scope.$watch('password', resetPassword);

    $http.get('/api/account/key')
        .then(function (res) {
          $scope.key = res.data;
        });

    $scope.signIn = function () {
      $scope.transmitting = true;

      $http.put('/api/account/sign-in', {
        password: $scope.password
      }).then(function () {
        $state.go('main');
      }, function (res) {
        var data = res.data;

        if (_.get(data, 'error.code')) {
          $scope.wrongPassword = true;
        }

        $scope.animateShake = true;
        $timeout(function () {
          $scope.animateShake = false;
          $scope.transmitting = false;
        }, 600);
      });
    };
  }
]);