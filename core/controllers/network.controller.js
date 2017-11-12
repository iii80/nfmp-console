var os = require('os');
var _ = require('lodash');
var logger = require('../../lib/logger.lib');
var exec = require('child_process').exec;

/**
 * 网络列表
 * @param {Object} req
 * @param {Object} res
 */
exports.list = function (req, res) {
  var networkSource = [];

  exec('ifconfig', function (err, stdout, stderr) {
    if (err) {
      logger.system().error(__filename, '打印网卡信息失败', err);
      return false;
    }

    var source = stdout.toString();

    var reg = /(\w+)\s+Link/mg;
    var result = source.match(reg).toString().replace(reg,'$1').split(',');

    _.map(result, function (item) {
      networkSource.push({
        name: item
      });
    });

    _.map(source.match(/inet addr:([\d|\.]+)/mg), function (item, index) {
      networkSource[index].address = item.replace('inet addr:', '');
    });

    _.map(source.match(/HWaddr ([\w|\:]+)/mg), function (item, index) {
      networkSource[index].mac = item.replace('HWaddr ', '');
    });

    _.map(source.match(/Mask:([\w|\.]+)/mg), function (item, index) {
      networkSource[index].netmask = item.replace('Mask:', '');
    });

    // _.map(source.match(/broadcast ([\w|\.]+)/mg), function (item, index) {
    //   networkSource[index].gw = item.replace('broadcast ', '');
    // });
  });

  var nodeNetwork = os.networkInterfaces();

  var networkActive = [];

  _.forEach(nodeNetwork, function (item, key) {
    _.forEach(item, function (_item, _key) {
      if (_item.family === 'IPv4') {
        networkActive.push(key);
      }
    });
  });

  networkSource = _.map(networkSource, function (item) {
    if (_.includes(networkActive, item.name)) {
      item.active = true;
    } else {
      item.active = false;
    }

    return item;
  });

  res.status(200).json(networkSource);
};

/**
 * 更改网卡
 * @param {Object} req
 * @param {Object} res
 */
exports.change = function (req, res) {
  req.checkParams({
    'network': {
      notEmpty: {
        options: [true],
        errorMessage: 'network 不能为空'
      }
    }
  });

  if (_.has(req.body, 'toggle')) {
    req.checkBody({
      'toggle': {
        notEmpty: {
          options: [true],
          errorMessage: 'toggle 不能为空'
        },
        isBoolean: { errorMessage: 'toggle 需为字符串' }
      }
    });

    if (req.validationErrors()) {
      logger.system().error(__filename, '参数验证失败', req.validationErrors());
      return res.status(400).end();
    }

    if (req.body.toggle === true) {
      exec('ifconfig ' + req.params.network + ' up', function (err, stdout, stderr) {
        if (err) {
          logger.system().error(__filename, '启动网卡' + req.params.network + '失败', err);
          return res.status(400).end();
        }

        res.status(204).end();
      });
    } else {
      exec('ifconfig ' + req.params.network + ' down', function (err, stdout, stderr) {
        if (err) {
          logger.system().error(__filename, '禁止网卡' + req.params.network + '失败', err);
          return res.status(400).end();
        }

        res.status(204).end();
      });
    }
  } else {
    req.checkBody({
      'address': {
        notEmpty: {
          options: [true],
          errorMessage: 'address 不能为空'
        },
        isString: { errorMessage: 'address 需为字符串' }
      },
      'netmask': {
        notEmpty: {
          options: [true],
          errorMessage: 'netmask 不能为空'
        },
        isString: { errorMessage: 'netmask 需为字符串' }
      },
      // 'gw': {
      //   optional: true,
      //   isString: { errorMessage: 'gw 需为字符串' }
      // }
    });

    if (req.validationErrors()) {
      logger.system().error(__filename, '参数验证失败', req.validationErrors());
      return res.status(400).end();
    }

    var cmd = '';

    // if (_.has(req.body, 'gw')) {
    //   cmd = 'ifconfig ' + req.params.network + ' ' + req.body.address + ' netmask ' + req.body.netmask + ' gw ' + req.body.gw;
    // } else {
    //   cmd = 'ifconfig ' + req.params.network + ' ' + req.body.address + ' netmask ' + req.body.netmask;
    // }

    cmd = 'ifconfig ' + req.params.network + ' ' + req.body.address + ' netmask ' + req.body.netmask;

    exec(cmd, function (err, stdout, stderr) {
      if (err) {
        logger.system().error(__filename, '配置网卡' + req.params.network + '失败', err);
        return res.status(400).end();
      }

      res.status(204).end();
    });
  }
};