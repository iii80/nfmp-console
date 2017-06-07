var fs = require('fs');
var os = require('os');
var path = require('path');
var _ = require('lodash');
var logger = require('../../lib/logger.lib');

/**
 * 网络列表
 * @param {Object} req
 * @param {Object} res
 */
exports.list = function (req, res) {
  var network = os.networkInterfaces();

  var networkList = [];

  _.forEach(network, function (item, key) {
    var isEth = /^eth.+$/.test(key);

    if (isEth) {
      item[0].name = key;
      networkList.push(item[0]);
    }
  });

  res.status(200).json(networkList);
};