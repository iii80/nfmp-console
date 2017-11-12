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
  }, 10);
};