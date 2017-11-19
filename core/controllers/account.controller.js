var fs = require('fs');
var path = require('path');
var getmac = require('getmac');
var logger = require('../../lib/logger.lib');
var sha1 = require('../services/sha1.service');

var key = '';

/**
 * 检查是否登陆
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
exports.check = function (req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({
      error: {
        code: 'NOT_LOGGED_IN',
        message: '没有登录'
      }
    });
  }
};

/**
 * KeyMac
 * @param {Object} req
 * @param {Function} res
 */
exports.keyMac = function (req, res) {
  fs.readFile(path.join(__dirname,'../../config/key.json'), function (err, data) {
    if (err && data) {
      logger.system().error(__filename, '获取 key 失败', err);

      return res.status(400).end();
    }

    getmac.getMac(function (err, addr) {
      if (err) {
        logger.system().error(__filename, '获取 MAC 地址失败');
        return res.status(400).end();
      }

      if (data) {
        key = JSON.parse(data).key;


        if (key === sha1(sha1(addr) + '948372')) {
          return res.status(204).end();
        } else {
          res.status(401).json({
            error: {
              code: 'WRONG_KEYVALUE',
              message: '序列号错误'
            }
          });
        }
      } else {
        getmac.getMac(function (err, addr) {
          if (err) {
            logger.system().error(__filename, '获取 MAC 地址失败');
            return res.status(400).end();
          }

          res.status(200).json(sha1(addr));
        });
      }
    });
  });
};

/**
 * KeyValue
 * @param {Object} req
* 				{String} req.body.keyValue
 * @param {Function} res
 */
exports.keyValue = function (req, res) {
  req.checkBody({
    'keyValue': {
      notEmpty: {
        options: [true],
        errorMessage: 'keyValue 不能为空'
      }
    }
  });

  if (req.validationErrors()) {
    logger.system().error(__filename, '参数验证失败', req.validationErrors());
    return res.status(400).end();
  }

  var keyValue = req.body.keyValue;

  getmac.getMac(function (err, addr) {
    if (err) {
      logger.system().error(__filename, '获取 MAC 地址失败');
      return res.status(400).end();
    }

    if (keyValue === sha1(sha1(addr) + '948372')) {
      fs.writeFile(path.join(__dirname,'../../config/key.json'), JSON.stringify({ "key": keyValue }), function (err) {
        if (err) {
          logger.system().error(__filename, '写入 SOURCE 失败', err);
          return res.status(400).end();
        }

        console.log(keyValue);

        res.status(204).end();
      });
    } else {
      res.status(401).json({
        error: {
          code: 'WRONG_KEYVALUE',
          message: '序列号错误'
        }
      });
    }
  });
};

/**
 * 登陆
 * @param {Object} req
 * 				{String} req.body.email
 * 				{String} req.body.password
 * @param {Function} res
 */
exports.signIn = function (req, res) {
  req.checkBody({
    'username': {
      notEmpty: {
        options: [true],
        errorMessage: 'username 不能为空'
      }
    },
    'password': {
      notEmpty: {
        options: [true],
        errorMessage: 'password 不能为空'
      },
      isLength: {
        options: [6],
        errorMessage: 'password 不能小于 6 位'
      }
    }
  });

  var username = req.body.username;
  var password = sha1(req.body.password);

  if (req.validationErrors()) {
    logger.system().error(__filename, '参数验证失败', req.validationErrors());
    return res.status(400).end();
  }

  if (username === 'admin' && password === '29903019d1383201b5451d5e2fb3f63e3d63704c') {
    req.session.user = 'admin';

    res.status(204).end();
  } else {
    res.status(401).json({
      error: {
        code: 'WRONG_USERNAME_OR_PASSWORD',
        message: '账号或密码错误'
      }
    });
  }
};

/**
 * 注销登陆
 * @param {Object} req
 * @param {Object} res
 */
exports.signOut = function (req, res) {
  req.session.destroy(function(err) {
    if (err) {
      logger.system().error(__filename, err);
      return res.status(500).end();
    }

    res.status(204).end();
  });
};