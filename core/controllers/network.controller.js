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
    _.forEach(item, function (_item, _key) {
      if (item.length <= 1) {
        _item.name = key;
      } else {
        _item.name = key + '-' + (_key + 1);
      }

      networkList.push(_item);
    });
  });

  res.status(200).json(networkList);
};