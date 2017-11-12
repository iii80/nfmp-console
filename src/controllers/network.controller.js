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
    $scope.networkConfig = {
      address: '',
      netmask: ''
      // gw: ''
    };

    /**
     * 读取网络配置列表
     */
    function reload() {
      $http.get('/api/network')
        .then(function (res) {
          var data = res.data;

          $scope.network = data;
        });
    }; reload();

    /**
     * 启用禁用网卡
     */
    $scope.changeNetwork = function (item) {
      $http.put('/api/network/' + item.name, { toggle: !item.active })
        .then(function (res) {
          reload();
        });
      item.active = !item.active;
    };

    /**
     * 配置网卡
     */
    $scope.networkModel = function (item, index) {
      $scope.networkForm.$setPristine();
      $scope.networkForm.$setUntouched();

      $scope.networkConfig = {
        name: item.name,
        address: item.address,
        netmask: item.netmask
        // gw: item.gw
      };

      $('#networkModal').modal('show');

      reload();
    };

    $scope.saveNetworkConfig = function () {
      var data = {
        address: $scope.networkConfig.address,
        netmask: $scope.networkConfig.netmask
        // gw: $scope.networkConfig.gw
      };

      $http.put('/api/network/' + $scope.networkConfig.name, data)
        .then(function () {
          reload();
        });

      $('#networkModal').modal('hide');
    };
  }
]);