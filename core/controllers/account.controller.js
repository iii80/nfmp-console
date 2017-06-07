var fs = require('fs');
var path = require('path');
var getmac = require('getmac');
var logger = require('../../lib/logger.lib');
var sha1 = require('../services/sha1.service');

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
 * Key
 * @param {Object} req
 * @param {Function} res
 */
exports.key = function (req, res) {
  getmac.getMac(function (err, addr) {
    if (err) {
      logger.system().error(__filename, '获取 MAC 地址失败');
      return res.status(400).end();
    }

    res.status(200).json(sha1(addr));
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

  var password = req.body.password;

  if (req.validationErrors()) {
    logger.system().error(__filename, '参数验证失败', req.validationErrors());
    return res.status(400).end();
  }

  getmac.getMac(function (err, addr) {
    if (err) {
      logger.system().error(__filename, '获取 MAC 地址失败');
      return res.status(400).end();
    }

    if (password === sha1(sha1(addr))) {
      req.session.user = 'admin';
      req.session.cookie.maxAge = 60 * 1000 * 60 * 24 * 90;

      res.status(204).end();
    } else {
      res.status(401).json({
        error: {
          code: 'WRONG_PASSWORD',
          message: '密码错误'
        }
      });
    }
  });
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