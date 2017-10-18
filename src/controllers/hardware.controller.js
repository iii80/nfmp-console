/**
 * Hardware Controller
 */
angular.module('controllers').controller('hardware', ['$scope', '$state', '$stateParams', '$http', '$interval',
  function ($scope, $state, $stateParams, $http, $interval) {
    'use strict';

    /**
     * 初始化变量
     */
    $scope.transmitting = false;
    $scope.cpu = 0;
    $scope.mem = 0;
    var transmitData = {
      labels: ['00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00'],
      datasets: [
        {
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,]
        }
      ]
    };

    var chartTransmitData = function (number) {
      var labels = moment().format('hh:mm:ss');
      var datasets = number;

      transmitData.labels.push(labels);
      transmitData.datasets[0].data.push(datasets);

      if (transmitData.labels.length > 50) {
        transmitData.labels = _.drop(transmitData.labels);
        transmitData.datasets[0].data = _.drop(transmitData.datasets[0].data);
      }

      return transmitData;
    };

    var receiveData = {
      labels: ['00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00'],
      datasets: [
        {
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,]
        }
      ]
    };

    var chartReceiveData = function (number) {
      var labels = moment().format('hh:mm:ss');
      var datasets = number;

      receiveData.labels.push(labels);
      receiveData.datasets[0].data.push(datasets);

      if (receiveData.labels.length > 50) {
        receiveData.labels = _.drop(receiveData.labels);
        receiveData.datasets[0].data = _.drop(receiveData.datasets[0].data);
      }

      return receiveData;
    };

    $scope.$on('$viewContentLoaded', function(){
      /**
       * 上行带宽图表
       */
      var transmitChart = new Chart($('#transmitChart').get(0).getContext('2d'), {
        type: 'line',
        options: {
          tooltips: {
            enabled: false
          },
          legend: {
            display: false
          },
          elements: {
            line: {
              borderWidth: 1
            }
          },
          animation: {
            duration: 0
          }
        }
      });

      /**
       * 下行带宽图表
       */
      var receiveChart = new Chart($('#transmitChart').get(0).getContext('2d'), {
        type: 'line',
        options: {
          tooltips: {
            enabled: false
          },
          legend: {
            display: false
          },
          elements: {
            line: {
              borderWidth: 1
            }
          },
          animation: {
            duration: 0
          }
        }
      });

      /**
       * 读取硬件信息
       */
      $interval(function () {
        $http.get('/api/hardware')
            .then(function (res) {
              var data = res.data;

              $scope.cpu = data.cpu;
              $scope.mem = data.mem;

              transmitChart.data = chartTransmitData(data.transmit);
              receiveChart.data = chartReceiveData(data.receive);
              transmitChart.update();
              receiveChart.update();
            });
      }, 1000);
    });








  }
]);