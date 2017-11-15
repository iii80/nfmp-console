var _ = require('lodash');
var exec = require('child_process').exec;

/**
 * 获取所有网卡信息
 * @callback {Object} 网卡列表
 */
exports.list = function (callback) {
  exec('ifconfig -a', function (err, stdout) {
    if (err) {
      err.type = 'system';
      err.message = '打印网卡信息失败';
      callback(err);
      return false;
    }

    var networkSource = _.initial(stdout.toString().split(/\n\n/));

    networkSource = _.map(networkSource, function (item) {
      var data = {};

      data.name = _.get(/([\w|\.|\:]+)\s+Link/mg.exec(item), 1);

      data.address = _.get(/inet addr:([\d|\.]+)/mg.exec(item), 1);
      data.mac = _.get(/HWaddr ([\w|\:]+)/mg.exec(item), 1);
      data.netmask = _.get(/Mask:([\w|\.]+)/mg.exec(item), 1);

      return data;
    });

    exec('ifconfig', function (err, stdout) {
      if (err) {
        err.type = 'system';
        err.message = '打印网卡信息失败';
        callback(err);
        return false;
      }

      var source = stdout.toString();
      var _result = source.match(/([\w|\.|\:]+)\s+Link/mg).toString().replace(/([\w|\.|\:]+)\s+Link/mg, '$1').split(',');

      networkSource = _.map(networkSource, function (item) {
        if (_.includes(_result, item.name)) {
          item.active = true;
        } else {
          item.active = false;
        }

        return item;
      });

      var output = _.reject(networkSource, { name: 'lo' });

      callback(null, output);
    });
  });
};

/**
 * 获取单个网卡信息
 * @callback {Object} 单个列表
 */
exports.one = function (name, callback) {
  exports.list(function (err, results) {
    if (err) {
      callback(err);
      return false;
    }

    callback(null, _.find(results, { name: name }));
  });
};