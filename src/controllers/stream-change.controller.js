/**
 * Stream Change Controller
 */
angular.module('controllers').controller('streamChange', ['$scope', '$state', '$stateParams', '$http',
  function ($scope, $state, $stateParams, $http) {
    'use strict';

    /**
     * 初始化变量
     */
    $scope.transmitting = false;
    $scope.action = 'create';
    $scope._id = $stateParams._id;
    $scope.name = '';
    $scope.url = '';
    $scope.remark = '';

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
    if ($scope._id) {
      $scope.action = 'update';
      $scope.transmitting = true;

      $http.get('/api/channel/' + $scope._id)
          .then(function (res) {
            var data = res.data;

            $scope._id = data.name;
            $scope.url = data.url;
            $scope.source = data.source;
            $scope.remark = data.remark;

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
        networkName: $scope.networkName,
        name: $scope.name,
        url: $scope.url
      };

      if ($scope._id) {
        // $http.put('/api/channel/' + $scope._id, channel)
        //     .then(function () {
        //       $scope.$emit('notification', {
        //         type: 'success',
        //         message: '更新频道成功'
        //       });
        //
        //       $state.go('main.channel', null, { reload: 'main.channel' });
        //     }, function () {
        //       $scope.$emit('notification', {
        //         type: 'danger',
        //         message: '创建频道失败'
        //       });
        //     });
      } else {
        $http.post('/api/stream', stream)
            .then(function () {
              $scope.$emit('notification', {
                type: 'success',
                message: '创建转码成功'
              });

              $state.go('main.stream', null, { reload: 'main.stream' });
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