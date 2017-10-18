var os = require('os');
var fs = require('fs');
var ps = require('current-processes');
var async = require('async');
var _ = require('lodash');
var logger = require('../../lib/logger.lib');

var cpuTotal = os.cpus().length;

var lastData = {
  transmit: 0,
  receive: 0
};

var currData = {
  transmit: 0,
  receive: 0,
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

  if (lastData.receive === 0) {
    currData.receive = 0;
    currData.transmit = 0;
  } else {
    currData.receive = _.round(receive - lastData.receive);
    currData.transmit = _.round(transmit - lastData.transmit);
  }

  lastData.receive = receive;
  lastData.transmit = transmit;
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
      transmit: currData.transmit,
      receive: currData.receive
    };

    res.status(200).json(output);
  });
};