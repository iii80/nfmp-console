/**
 * Stream Change Controller
 */
angular.module('controllers').controller('streamsChange', ['$scope', '$state', '$stateParams', '$http',
  function ($scope, $state, $stateParams, $http) {
    'use strict';

    /**
     * 初始化变量
     */
    $scope.transmitting = false;
    $scope.action = 'create';
    $scope.id = $stateParams.id;
    $scope.name = '';
    $scope.url = '';
    $scope.outUrl = 'udp://';
    $scope.hls = false;
    $scope.muhicast = false;

    $scope.network = {};
    $scope.networkName = '';

    /**
     * 读取网卡信息
     */
    $http.get('/api/network')
      .then(function (res) {
        var data = res.data;

        $scope.network = data;
      });

    /**
     * 读取频道
     */
    if ($scope.id) {
      $scope.action = 'update';
      $scope.transmitting = true;

      $http.get('/api/streams/' + $scope.id)
          .then(function (res) {
            var data = res.data;

            $scope.name = data.name;
            $scope.url = data.url;

            if (data.hls) $scope.hls = data.hls;

            if (data.muhicast) {
              $scope.muhicast = data.muhicast
              $scope.network = data.network;
              $scope.outUrl = data.outUrl;
            }

            $scope.transmitting = false;
          }, function () {
            $scope.$emit('notification', {
              type: 'danger',
              message: '获取频道失败'
            });
          });
    }

    /**
     * 保存频道
     */
    $scope.saveStream = function () {
      $scope.transmitting = true;

      var stream = {
        name: $scope.name,
        url: $scope.url
      };

      if ($scope.hls) {
        stream.hls = true;
      }

      if ($scope.muhicast) {
        stream.muhicast = true;
        stream.network = $scope.networkName;
        stream.outUrl = $scope.outUrl;
      }

      if ($scope.id) {
        $http.put('/api/streams/' + $scope.id, stream)
          .then(function () {
            $scope.$emit('notification', {
              type: 'success',
              message: '更新转码成功'
            });

            $state.go('main.streams', null, { reload: 'main.streams' });
          }, function () {
            $scope.$emit('notification', {
              type: 'danger',
              message: '更新转码失败'
            });
          });
      } else {
        $http.post('/api/streams', stream)
            .then(function () {
              $scope.$emit('notification', {
                type: 'success',
                message: '创建转码成功'
              });

              $state.go('main.streams', null, { reload: 'main.streams' });
            }, function () {
              $scope.$emit('notification', {
                type: 'danger',
                message: '创建转码失败'
              });
            });
      }
    }
  }
]);