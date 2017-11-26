var os = require('os');
var osUtils = require('os-utils');
var fs = require('fs');
var ps = require('current-processes');
var async = require('async');
var _ = require('lodash');
var spawn = require('child_process').spawn;
var logger = require('../../lib/logger.lib');

var oldListData = [];
var network = [];
var cpu = {};
var mem = {};
var network = [];

var timeout = null;

/**
 * 获取硬件信息
 */
setInterval(function () {
  /**
   * 获取网卡信息
   */
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

  if (network.length === 0) {
    network = _.map(list, function (item) {
      return { name: item[0], receive: 0, transmit: 0 };
    });

    network.unshift({ name: '全部网卡', receive: 0, transmit: 0 });
  } else {
    network = _.map(list, function (item, index) {
      return {
        name: '网卡' + item[0].replace(/:/, ''),
        receive:  _.floor((Number(item[1]) - Number(oldListData[index][1])) * 8 / 1024),
        transmit:  _.floor((Number(item[9]) - Number(oldListData[index][9])) * 8 / 1024)
      };
    });

    network.unshift({
      name: '全部网卡',
      receive: _.floor((totalData('receive', list) - totalData('receive', oldListData)) * 8 / 1024),
      transmit: _.floor((totalData('transmit', list) - totalData('transmit', oldListData)) * 8 / 1024)
    });
  }

  oldListData = list;

  /**
   * 获取CPU信息
   */
  osUtils.cpuUsage(function (cpuUsage) {
    var osCpu = os.cpus();

    cpu = {
      usage: cpuUsage * 100,
      model: osCpu[0].model,
      amount: osCpu.length
    };
  });

  /**
   * 获取内存信息
   */
  var prc = spawn('free', []);
  prc.stdout.setEncoding('utf8');
  prc.stdout.on('data', function (data) {
    var lines = data.toString().split(/\n/g);
    var line = lines[1].split(/\s+/);
    var total = parseInt(line[1], 10);
    // var free = parseInt(line[3], 10);
    // var buffers = parseInt(line[5], 10);
    // var cached = parseInt(line[6], 10);
    // var actualFree = free + buffers + cached;

    mem = {
      total: total,
      usage: parseInt(line[2], 10)
      // free: free,
      // shared: parseInt(line[4], 10),
      // buffers: buffers,
      // cached: cached,
      // actualFree: actualFree,
      // percentUsed: parseFloat(((1 - (actualFree / total)) * 100).toFixed(2)),
      // comparePercentUsed: ((1 - (os.freemem() / os.totalmem())) * 100).toFixed(2)
    };
  });
  prc.on('error', function (err) {
    logger.system().error(__filename, '获取内存错误', err);
  });
}, 100);

/**
 * 硬件信息
 */
exports.information = function (socket) {
  timeout = setInterval(function () {
    var output = {
      cpu: cpu,
      mem: mem,
      network: network
    };

    socket.emit('hardware', output);
  }, 500);
};

/**
 * 断开连接
 */
exports.disconnect = function () {
  clearInterval(timeout);
};