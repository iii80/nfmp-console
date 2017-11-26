/**
 * Main Controller
 */
angular.module('controllers').controller('main', ['$scope', '$state', '$rootscope',
  function ($scope, $state, $rootscope) {
    'use strict';

    if ($state.current.name === 'main') {
      $state.go('main.hardware');
    }

    // 连接socket
    $rootscope.socket = io.connect('/');
  }
]);