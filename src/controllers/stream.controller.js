/**
 * Stream Controller
 */
angular.module('controllers').controller('stream', ['$scope', '$state', '$stateParams', '$http',
  function ($scope, $state, $stateParams, $http) {
    'use strict';

    /**
     * 初始化变量
     */
    $scope.transmitting = false;
    $scope.deleteStreamlId = '';
    $scope.stream = [];

    /**
     * 读取频道列表
     */
    $http.get('/api/stream')
      .then(function (res) {
        var data = res.data;

        $scope.stream = data;
      });

    /**
     * 删除频道
     */
    $scope.deleteStream = function () {
      $scope.transmitting = true;

      $http.delete('/api/stream/' + $scope.deleteStreamId)
        .then(function () {
          $('#deleteModal').modal('hide');

          $scope.transmitting = false;

          $scope.stream = _.reject($scope.stream, { name:  $scope.deleteStreamId });

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