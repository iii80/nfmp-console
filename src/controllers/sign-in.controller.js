/**
 * Sign In Controller
 */
angular.module('controllers').controller('signIn', ['$scope', '$timeout', '$state', '$http',
  function ($scope, $timeout, $state, $http) {
    'use strict';

    $scope.transmitting = false;
    $scope.password = '';
    $scope.autoSignIn = false;
    $scope.wrong = false;
    $scope.hasKeyValue = false;
    $scope.keyMac = '';
    $scope.keyValue = '';
    $scope.username = '';

    function reset () {
      $scope.wrong = false;
    }

    $http.get('/api/account/key')
      .then(function (res) {
        var data = res.data;

        if (data) {
          $scope.keyMac = data;
        } else {
          $scope.hasKeyValue = true;
        }
      });

    $scope.$watch(['keyValue', 'account', 'password'], reset, true);

    $scope.keyForm = function () {
      $scope.transmitting = true;

      $http.put('/api/account/key', {
        keyValue: $scope.keyValue
      }).then(function () {
        $scope.hasKeyValue = true;
        $scope.transmitting = false;
      }, function (res) {
        var data = res.data;

        if (_.get(data, 'error.code')) {
          $scope.wrong = true;
        }

        $scope.animateShake = true;
        $timeout(function () {
          $scope.animateShake = false;
          $scope.transmitting = false;
        }, 600);
      });
    };

    $scope.signIn = function () {
      $scope.transmitting = true;

      $http.put('/api/account/sign-in', {
        username: $scope.username,
        password: $scope.password
      }).then(function () {
        $state.go('main');
      }, function (res) {
        var data = res.data;

        if (_.get(data, 'error.code')) {
          $scope.wrong = true;
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