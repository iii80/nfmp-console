var async = require('async');
var logger = require('../../lib/logger.lib');

/**
 * 404 错误
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
exports.notFound = function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
};

/**
 * 其他错误
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
exports.error = function (err, req, res, next) {
  if (err) {
    logger.system().error(err);
  }

  res.status(err.status).end();
};