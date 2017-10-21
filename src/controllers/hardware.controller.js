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
    $scope.network = [];
    $scope.data = [];
    $scope.chart = [];
    $scope.select = 0;
    var chartFlag = false;

    function chart () {
      if (!$scope.data[0]) {
        $scope.data = _.map($scope.network, function (item) {
          return {
            transmit: {
              labels: ['00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00'],
              datasets: [
                {
                  data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,]
                }
              ]
            },
            receive: {
              labels: ['00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00'],
              datasets: [
                {
                  data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,]
                }
              ]
            }
          }
        });
      } else {
        var labels = moment().format('hh:mm:ss');
        var datasets = number;

        _.map($scope.network, function (item, index) {
          var data = $scope.data[index];

          data.transmit.labels.push(labels);
          data.receive.labels.push(labels);
          data.transmit.datasets.data.push(item.transmit);
          data.receive.datasets.data.push(item.receive);

          if (data.transmit.length > 50) {
            data.transmit.labels = _.drop(data.transmit.labels);
            data.receive.datasets[0].data = _.drop(data.receive.datasets[0].data);
            data.transmit.labels = _.drop(data.transmit.labels);
            data.receive.datasets[0].data = _.drop(data.receive.datasets[0].data);
          }
        })
      }
    }

    function chartInit () {
      chartFlag = true;

      _.map($scope.network, function (item, index) {
        $scope.chart[index] = {
          transmit: new Chart($('#transmitChart' + index).get(0).getContext('2d'), {
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
          }),
          receive: new Chart($('#receiveChart' + index).get(0).getContext('2d'), {
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
          })
        }
      });
    }

    function updateChart() {
      _.map($scope.network, function (item, index) {
        $scope.chart[index].transmit.update();
        $scope.chart[index].receive.update();
      });
    }

    $scope.$on('$viewContentLoaded', function(){
      /**
       * 读取硬件信息
       */
      $interval(function () {
        $http.get('/api/hardware')
          .then(function (res) {
            var data = res.data;

            $scope.cpu = data.cpu;
            $scope.mem = data.mem;
            $scope.network = data.network;

            if (!chartFlag) chartInit();

            updateChart();
          });
      }, 1000);
    });








  }
]);