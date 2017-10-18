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


    var data = {
      labels : ["January","February","March","April","May","June","July"],
      datasets : [
        {
          data : [65,59,90,81,56,55,40]
        }
      ]
    }

    var chartData = function (number) {
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
       * 读取硬件信息
       */
      $interval(function () {
        $http.get('/api/hardware')
            .then(function (res) {
              var data = res.data;

              $scope.cpu = data.cpu;
              $scope.mem = data.mem;

              transmitChart.data = chartData(data.cpu);
              transmitChart.update();
            });
      }, 1000);
    });








  }
]);