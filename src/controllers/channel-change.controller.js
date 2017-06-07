/**
 * Channel Controller
 */
angular.module('controllers').controller('channelChange', ['$scope', '$state', '$stateParams', '$http',
  function ($scope, $state, $stateParams, $http) {
    'use strict';

    /**
     * 初始化变量
     */
    $scope.transmitting = false;
    $scope.action = 'create';
    $scope._id = $stateParams._id;
    $scope.url = '';
    $scope.source = '';
    $scope.remark = '';

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
    $scope.saveChannel = function () {
      $scope.transmitting = true;

      var channel = {
        url: $scope.url,
        source: $scope.source,
        remark: $scope.remark
      };

      if ($scope._id) {
        $http.put('/api/channel/' + $scope._id, channel)
            .then(function () {
              $scope.$emit('notification', {
                type: 'success',
                message: '更新频道成功'
              });

              $state.go('main.channel', null, { reload: 'main.channel' });
            }, function () {
              $scope.$emit('notification', {
                type: 'danger',
                message: '创建频道失败'
              });
            });
      } else {
        $http.post('/api/channel', channel)
            .then(function () {
              $scope.$emit('notification', {
                type: 'success',
                message: '创建频道成功'
              });

              $state.go('main.channel', null, { reload: 'main.channel' });
            }, function () {
              $scope.$emit('notification', {
                type: 'danger',
                message: '创建频道失败'
              });
            });
      }
    }
  }
]);