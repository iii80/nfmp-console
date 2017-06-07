/**
 * Network Controller
 */
angular.module('controllers').controller('network', ['$scope', '$state', '$stateParams', '$http',
  function ($scope, $state, $stateParams, $http) {
    'use strict';

    /**
     * 初始化变量
     */
    $scope.transmitting = false;
    $scope.network = [];

    /**
     * 读取网络配置列表
     */
    $http.get('/api/network')
        .then(function (res) {
          var data = res.data;

          $scope.network = data;
        });
  }
]);