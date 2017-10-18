var os = require('os');
var fs = require('fs');
var ps = require('current-processes');
var async = require('async');
var _ = require('lodash');
var logger = require('../../lib/logger.lib');

var cpuTotal = os.cpus().length;

var data = 'Inter-|   Receive                                                |  Transmit\n face |bytes    packets errs drop fifo frame compressed multicast|bytes    packets errs drop fifo colls carrier compressed\n  eth0: 473301381 1898166    0    0    0     0          0         0 220396218 2351183    0    0    0     0       0          0\n  eth1: 11057048317 53053851    0    2    0     0          0         0 52899513348 50096908    0    0    0     0       0          0\n    lo: 61867025398 91443352    0    0    0     0          0         0 61867025398 91443352    0    0    0     0       0          0\n';

var lastData = {
  transmit: 0,
  receive: 0
};

setInterval(function (args) {
  var sourceData =  fs.readFileSync('/proc/net/dev').toString();

  // 按换行符分割数据转数组
  var clearN = sourceData.split('\n');

  // 去掉表头和空格
  var clearHead = _(clearN).drop(2).initial().value();

  // 转为格式化数据
  var list = _.map(clearHead, function (item) {
    // 按空格分割数据转数组
    var clearSpace = item.split(' ');

    // 过滤掉空格
    return _.filter(clearSpace, function (item) {
      return item !== '';
    });
  });

  // 接收的总流量
  var receive = _.reduce(list, function(total, n) {
    return total + Number(n[1]);
  }, 0);

  // 发送的总流量
  var transmit = _.reduce(list, function(total, n) {
    return total + Number(n[9]);
  }, 0);

  var currReceive = _.round(receive - lastData.receive);
  var currTransmit = _.round(receive - lastData.transmit);

  lastData.receive = receive;
  lastData.transmit = transmit;

  console.log(currReceive, currTransmit);
}, 1000);


/**
 * 硬件信息
 * @param {Object} req
 * @param {Object} res
 */
exports.information = function (req, res) {
  async.parallel({
    cpuAndMem: function (callback) {
      ps.get(function (err, processes) {
        if (err) {
          err.type = 'system';
          callback(err);

          return false;
        }

        var cpuUsage = _.reduce(_.map(processes, 'cpu'), function (sum, n) {
          return sum + n;
        });

        var memUsage = _.reduce(_.map(processes, 'mem.usage'), function (sum, n) {
          return sum + n;
        });

        var information = {
          cpu: _.round(cpuUsage / cpuTotal),
          mem: _.round(memUsage)
        };

        callback(null, information);
      });
    },
    network: function (callback) {


      var output = {
        transmit: transmit / 1024,
        receive: receive / 1024
      };

      callback(null, output);
    }
  }, function (err, results) {
    if (err) {
      logger[err.type]().error(__filename, '获取硬件信息失败', err);
      res.status(400).end();

      return false;
    }

    var output = {
      cpu: results.cpuAndMem.cpu,
      mem: results.cpuAndMem.mem,
      transmit: results.network.transmit,
      receive: results.network.receive
    };

    res.status(200).json(output);
  });
};