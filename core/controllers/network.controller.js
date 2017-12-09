var _ = require('lodash');
var logger = require('../../lib/logger.lib');
var exec = require('child_process').exec;
var fs = require('fs');
var network = require('../services/network.service');

/**
 * 网络列表
 * @param {Object} req
 * @param {Object} res
 */
exports.list = function (req, res) {
  network.list(function (err, results) {
    if (err) {
      logger[err.type]().error(__filename, err.message, err);
      return false;
    }

    res.status(200).json(results);
  });
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

    var cmd;

    if (req.body.toggle === true) {
      cmd = 'ifconfig ' + req.params.network + ' up';

      exec(cmd, function (err, stdout, stderr) {
        if (err) {
          logger.system().error(__filename, '启动网卡' + req.params.network + '失败', err);
          return res.status(400).end();
        }

        fs.readFile('/etc/rc.d/rc.local', function (err, data) {
          if (err && data) {
            logger.system().error(__filename, '获取 Stream 失败', err);
            return res.status(400).end();
          }

          var lines = data.split(/\n/g);

          _.forEach(lines, function (item) {
            if (item !== cmd) {
              item = cmd;
            }
          });

          fs.writeFile('/etc/rc.d/rc.local', lines.join('\n'), function (err) {
            if (err) {
              logger.system().error(__filename, '写入 Stream 失败', err);
              return res.status(400).end();
            }

            res.status(204).end();
          });
        });
      });
    } else {
      cmd = 'ifconfig ' + req.params.network + ' down';

      exec(cmd, function (err, stdout, stderr) {
        if (err) {
          logger.system().error(__filename, '禁止网卡' + req.params.network + '失败', err);
          return res.status(400).end();
        }

        fs.readFile('/etc/rc.d/rc.local', function (err, data) {
          if (err && data) {
            logger.system().error(__filename, '获取 Stream 失败', err);
            return res.status(400).end();
          }

          var lines = data.split(/\n/g);

          _.forEach(lines, function (item) {
            if (item !== cmd) {
              item = cmd;
            }
          });

          fs.writeFile('/etc/rc.d/rc.local', lines.join('\n'), function (err) {
            if (err) {
              logger.system().error(__filename, '写入 Stream 失败', err);
              return res.status(400).end();
            }

            res.status(204).end();
          });
        });
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
      }
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

      fs.readFile('/etc/rc.d/rc.local', function (err, data) {
        if (err && data) {
          logger.system().error(__filename, '获取 Stream 失败', err);
          return res.status(400).end();
        }

        var lines = data.split(/\n/g);

        _.forEach(lines, function (item) {
          var reg = new RegExp('^ifconfig ' + req.params.network + '.+');
          if (reg.test(item)) item = cmd;
        });

        fs.writeFile('/etc/rc.d/rc.local', lines.join('\n'), function (err) {
          if (err) {
            logger.system().error(__filename, '写入 Stream 失败', err);
            return res.status(400).end();
          }

          res.status(204).end();
        });
      });
    });
  }
};