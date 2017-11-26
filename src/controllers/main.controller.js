/**
 * Main Controller
 */
angular.module('controllers').controller('main', ['$scope', '$state', '$rootScope',
  function ($scope, $state, $rootScope) {
    'use strict';

    if ($state.current.name === 'main') {
      $state.go('main.hardware');
    }

    // 连接socket
    $rootScope.socket = io.connect('/');
  }
]);