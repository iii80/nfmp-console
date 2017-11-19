/**
 * Stream Controller
 */
angular.module('controllers').controller('streams', ['$scope', '$state', '$stateParams', '$http',
  function ($scope, $state, $stateParams, $http) {
    'use strict';

    /**
     * 初始化变量
     */
    $scope.transmitting = false;
    $scope.deleteStreamlId = '';
    $scope.stream = [];

    /**
     * 格式
     */
    $scope.translatePre = function (url) {
      var reg = /^(\w+)\:\/\//;
      var pre = _.get(url.match(reg), [1], '-');
      return pre;
    };

    /**
     * 读取频道列表
     */
    $http.get('/api/streams')
      .then(function (res) {
        var data = res.data;

        $scope.stream = data;

        _.map($scope.stream, function (item) {
          item.pid ? item.active = true : item.active = false;
        });
      });

    /**
     * 激活关闭
     */
    $scope.switchActive = function (item) {
      item.active = !item.active;

      $http.put('/api/streamSwitch', { id: item.id, active: item.active })
        .then(function () {
          return $scope.$emit('notification', {
            type: 'success',
            message: '激活转码成功'
          });
        }, function () {
          $scope.$emit('notification', {
            type: 'danger',
            message: '激活转码失败'
          });
        });
    };

    /**
     * 删除转码
     */
    $scope.deleteStream = function () {
      $scope.transmitting = true;

      $http.delete('/api/streams/' + $scope.deleteStreamId)
        .then(function () {
          $('#deleteModal').modal('hide');

          $scope.transmitting = false;

          $scope.stream = _.reject($scope.stream, { id:  $scope.deleteStreamId });

          return $scope.$emit('notification', {
            type: 'success',
            message: '删除转码成功'
          });
        }, function () {
          $scope.$emit('notification', {
            type: 'danger',
            message: '删除转码失败'
          });
        });
    }
  }
]);