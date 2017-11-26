/**
 * Hardware Controller
 */
angular.module('controllers').controller('hardware', ['$scope', '$state', '$stateParams', '$http', '$interval',
  function ($scope, $state, $stateParams, $http, $interval) {
    'use strict';

    /**
     * 初始化变量
     */
    $scope.cpuUsage = 0;
    $scope.cpuTotal = 0;
    $scope.cpuModel = '';
    $scope.memUsage = 0;
    $scope.memTotal = '';
    $scope.chartHeader = [];
    $scope.network = [];
    var data = [];
    var chart = [];
    $scope.select = 0;
    var chartFlag = false;
    var transmitChart;
    var receiveChart;


    function chartInit() {
      transmitChart = new Chart($('#transmitChart').get(0).getContext('2d'), {
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

      receiveChart = new Chart($('#receiveChart').get(0).getContext('2d'), {
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
    }

    function chartData (network) {
      if (!data[0]) {
        data = _.map(network, function (item, index) {
          $scope.chartHeader[index] = item.name;

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

        _.map(data, function (item, index) {
          item.transmit.labels.push(labels);
          item.transmit.labels.shift();

          item.transmit.datasets[0].data.push(network[index].transmit);
          item.transmit.datasets[0].data.shift();

          item.receive.labels.push(labels);
          item.receive.labels.shift();

          item.receive.datasets[0].data.push(network[index].receive);
          item.receive.datasets[0].data.shift();
        });

        $scope.updateChart();
      }
    }

    $scope.updateChart = function (index) {
      if (typeof index === 'number') {
        $scope.select = index;
      }

      transmitChart.data = data[$scope.select].transmit;
      receiveChart.data = data[$scope.select].receive;
      transmitChart.update();
      receiveChart.update();
    };

    $scope.$on('$viewContentLoaded', function(){
      if (chartFlag) return false;

      chartInit();

      chartFlag = true;
    });

    /**
     * 读取硬件信息
     */
    socket.on('hardware', _.throttle(function (res) {
      $scope.$apply(function () {
        $scope.cpuUsage = _.floor(res.cpu.usage);
        $scope.cpuAmount = res.cpu.amount;
        $scope.cpuModel = res.cpu.model;
        $scope.memUsage = _.floor(res.mem.usage / res.mem.total * 100);
        $scope.memTotal = _.floor(res.mem.total);
        chartData(res.network);
      });
    }, 1000));
  }
]);