/**
 * Main Controller
 */
angular.module('controllers').controller('main', ['$scope', '$state',
  function ($scope, $state) {
    'use strict';

    if ($state.current.name === 'main') {
      $state.go('main.channel');
    }
  }
]);