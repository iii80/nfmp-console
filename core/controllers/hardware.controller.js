var os = require('os');
var osUtils = require('os-utils');
var fs = require('fs');
var ps = require('current-processes');
var async = require('async');
var _ = require('lodash');
var logger = require('../../lib/logger.lib');

var oldListData = [];
var currData = [];

/**
 * 硬件信息
 * @param {Object} req
 * @param {Object} res
 */
exports.information = function (socket) {
  setInterval(function () {
    var memTotal = os.totalmem();
    var memUsage = memTotal - os.freemem();

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

      currData.unshift({ name: '全部网卡', receive: 0, transmit: 0 });
    } else {
      currData = _.map(list, function (item, index) {
        return {
          name: '网卡' + item[0].replace(/:/, ''),
          receive:  _.floor((Number(item[1]) - Number(oldListData[index][1])) * 8 / 1024),
          transmit:  _.floor((Number(item[9]) - Number(oldListData[index][9])) * 8 / 1024)
        };
      });

      currData.unshift({
        name: '全部网卡',
        receive: _.floor((totalData('receive', list) - totalData('receive', oldListData)) / 1024),
        transmit: _.floor((totalData('transmit', list) - totalData('transmit', oldListData)) / 1024)
      });
    }

    oldListData = list;

    async.parallel({
      cpuAndMem: function (callback) {
        osUtils.cpuUsage(function (cpuUsage) {
          var osCpu = os.cpus();

          var information = {
            cpu: {
              usage: cpuUsage * 100,
              model: osCpu[0].model,
              amount: osCpu.length
            },
            mem: {
              usage: memUsage,
              total: memTotal
            }
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

      socket.emit('hardware', output);
    });
  }, 100);
};