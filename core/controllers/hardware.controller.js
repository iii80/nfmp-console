var os = require('os');
var fs = require('fs');
var ps = require('current-processes');
var async = require('async');
var _ = require('lodash');
var logger = require('../../lib/logger.lib');

var cpuTotal = os.cpus().length;

var oldListData = [];

var currData = [];

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


  function totalData (type, data) {
    return _.reduce(data, function(total, n) {
      if (type === 'receive') {
        return total + Number(n[1]);
      } else if (type === 'transmit') {
        return total + Number(n[9]);
      }
    }, 0);
  }

  if (currData.length === 0) {
    currData = _.map(list, function (item) {
      return { name: item[0], receive: 0, transmit: 0 };
    });

    currData.unshift({ name: '全部', receive: 0, transmit: 0 });
  } else {
    currData = _.map(list, function (item, index) {
      return {
        name: item[0],
        receive:  _.round((Number(item[1]) - Number(oldListData[index][1])) / 1024),
        transmit:  _.round((Number(item[9]) - Number(oldListData[index][9])) / 1024)
      };
    });

    currData.unshift({
      name: '全部',
      receive: _.round((totalData('receive', list) - totalData('receive', oldListData)) / 1024),
      transmit: _.round((totalData('transmit', list) - totalData('transmit', oldListData)) / 1024)
    });
  }

  oldListData = list;
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
      network: currData
    };

    res.status(200).json(output);
  });
};