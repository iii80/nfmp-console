/**
 * Channel Controller
 */
angular.module('controllers').controller('channel', ['$scope', '$state', '$stateParams', '$http',
  function ($scope, $state, $stateParams, $http) {
    'use strict';

    /**
     * 初始化变量
     */
    $scope.transmitting = false;
    $scope.deleteChannelId = '';
    $scope.channel = [];

    /**
     * 翻译格式
     */
    $scope.translate = function (str) {
      var pre = str.match(/^(\w+)\:\/\//);

      if (!pre || !pre[1]) {
        return '其他'
      }

      switch (pre[1]) {
        case 'rtmp':
          return 'rtmp';

          break;
        case 'http':
          var last = str.match(/\.(\w+)$/)

          if (last && last[1]) {
            return last[1];
          } else {
            return '其他';
          }

          break;
        default:
          return pre[1];
      }
    };

    /**
     * 读取频道列表
     */
    $http.get('/api/channel')
      .then(function (res) {
        var data = res.data;

        $scope.channel = data;
      });

    /**
     * 删除频道
     */
    $scope.deleteChannel = function () {
      $scope.transmitting = true;

      $http.delete('/api/channel/' + $scope.deleteChannelId)
        .then(function () {
          $('#deleteModal').modal('hide');

          $scope.transmitting = false;

          $scope.channel = _.reject($scope.channel, { name:  $scope.deleteChannelId });

          return $scope.$emit('notification', {
            type: 'success',
            message: '删除频道成功'
          });
        }, function () {
          $scope.$emit('notification', {
            type: 'danger',
            message: '删除频道失败'
          });
        });
    }
  }
]);