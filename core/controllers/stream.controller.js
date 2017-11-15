var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var _ = require('lodash');
var async = require('async');
var exec = require('child_process').exec;
var logger = require('../../lib/logger.lib');
var networkService = require('../services/network.service');

/**
 * 转码信息
 * @param {Object} req
 *        {Object} req.body._id
 * @param {Object} res
 */
exports.one = function (req, res) {
  req.checkParams({
    '_id': {
      notEmpty: {
        options: [true],
        errorMessage: '_id 不能为空'
      }
    }
  });

  if (req.validationErrors()) {
    logger.system().error(__filename, '参数验证失败', req.validationErrors());
    return res.status(400).end();
  }

  var _id = req.params._id;

  fs.readFile(path.join(__dirname,'../../config/stream.json'), function (err, data) {
    if (err && data) {
      logger.system().error(__filename, '获取 Stream 失败', err);
      return res.status(400).end();
    }

    if (!data) {
      return res.status(200).json([]);
    }

    var stream = JSON.parse(data);
    var item = _.find(stream, { name: _id });

    res.status(200).json(item);
  });
};

/**
 * 转码列表
 * @param {Object} req
 * @param {Object} res
 */
exports.list = function (req, res) {
  fs.readFile(path.join(__dirname,'../../config/stream.json'), function (err, data) {
    if (err && data) {
      logger.system().error(__filename, '获取 Stream 失败', err);
      return res.status(400).end();
    }

    if (!data) {
      return res.status(200).json([]);
    }

    var streamList = JSON.parse(data);

    res.status(200).json(streamList);
  });
};

/**
 * 创建转码
 * @param {Object} req
 *        {String} req.body.name
 *        {String} req.body.url
 * @param {Object} res
 */
exports.create = function (req, res) {
  req.checkBody({
    'networkName': {
      notEmpty: {
        options: [true],
        errorMessage: 'networkName 不能为空'
      },
      isString: { errorMessage: 'networkName 需为字符串' }
    },
    'name': {
      notEmpty: {
        options: [true],
        errorMessage: 'name 不能为空'
      },
      isString: { errorMessage: 'name 需为字符串' }
    },
    'url': {
      notEmpty: {
        options: [true],
        errorMessage: 'url 不能为空'
      },
      isString: { errorMessage: 'url 需为字符串' }
    }
  });

  if (req.validationErrors()) {
    logger.system().error(__filename, '参数验证失败', req.validationErrors() );
    return res.status(400).end();
  }

  var stream = {
    networkName: req.body.networkName,
    name: req.body.name,
    url: req.body.url,
    active: true
  };

  async.auto({
    mkdir: function (callback) {
      mkdirp(path.join(__dirname, '../../stream/' + stream.name), function (err) {
        if (err) err.type = 'system';

        callback(err);
      });
    },
    getNetwork: function (callback) {
      networkService.one(stream.networkName, function (err, result) {
        if (err) err.type = 'system';

        callback(err, result);
      });
    },
    createCMD: ['mkdir', 'getNetwork', function (callback, results) {
      var cmd = 'ffmpeg -i ' +
        stream.url +
        ' -vcodec copy -acodec copy -f hls -hls_list_size 6 -hls_wrap 10 -hls_time 10 ' +
        path.join(__dirname, '../../stream/' + stream.name + '/1.m3u8') +
        ' -vcodec copy -acodec copy -f mpegts ' +
        stream.url +
        '?localaddr=' + results.getNetwork.address;

      callback(null, cmd);
    }],
    writeData: ['createCMD', function (callback, results) {
      fs.readFile(path.join(__dirname,'../../config/stream.json'), function (err, data) {
        if (err && data) {
          err.type = 'system';
          err.message = '获取 Stream 失败';
          callback(err);
          return false;
        }

        var streamList;

        if (!data) {
          streamList = [];

          stream.id = '001';
          stream.cmd = results.createCMD;
        } else {
          streamList = JSON.parse(data);

          var _id = (Number(_.sortBy(streamList, 'id')[streamList.length - 1].id) + 1) + '';

          switch (_id.length) {
            case 1:
              _id = '00' + _id;

              break;
            case 2:
              _id = '0' + _id;
          }

          stream.id = _id;
        }

        streamList.push(stream);

        fs.writeFile(path.join(__dirname,'../../config/stream.json'), JSON.stringify(streamList), function (err) {
          if (err) {
            err.type = 'system';
            err.message = '写入 Stream 失败';
            callback(err);
            return false;
          }

          callback();
        });
      });
    }],
    runCMD: ['createCMD', function (callback, results) {
      exec(results.createCMD, function (err, stdout) {
        // if (err) {
        //   err.type = 'system';
        //   err.message = '执行 Stream 命令失败';
        //   callback(err);
        //   return false;
        // }

        callback(null, stdout);
      });
    }]
  }, function (err, results) {
    if (err) {
      logger[err.type]().error(__filename, err.message, err);
      return res.status(500).end();
    }

    res.status(204).end();
  });


};

/**
 * 更新频道
 * @param {Object} req
 *        {MongoId} req.body._id
 * @param {Object} res
 */
exports.update = function (req, res) {
  req.checkParams({
    '_id': {
      notEmpty: {
        options: [true],
        errorMessage: '_id 不能为空'
      }
    }
  });

  req.checkBody({
    'name': {
      notEmpty: {
        options: [true],
        errorMessage: 'name 不能为空'
      },
      isString: { errorMessage: 'name 需为字符串' }
    },
    'url': {
      notEmpty: {
        options: [true],
        errorMessage: 'url 不能为空'
      },
      isString: { errorMessage: 'url 需为字符串' }
    }
  });

  if (req.validationErrors()) {
    logger.system().error(__filename, '参数验证失败', req.validationErrors());
    return res.status(400).end();
  }

  var _id = req.params._id;

  switch (_id.length) {
    case 1:
      _id = '00' + _id;

      break;
    case 2:
      _id = '0' + _id;
  }

  var newStream = {
    name: req.body.name,
    url: req.body.url,
    active: true
  };

  fs.readFile(path.join(__dirname,'../../config/stream.json'), function (err, data) {
    if (err) {
      logger.system().error(__filename, '获取 Stream 失败', err);
      return res.status(400).end();
    }

    var channelList = JSON.parse(data);

    _.map(channelList, function (item) {
      if (item.name === _id) {
        item.url = newChannel.url;
        item.source = newChannel.source;
        item.remark = newChannel.remark;
        item.provider = newChannel.provider;
      }
    });

    fs.writeFile(path.join(__dirname,'../../config/sources.json'), JSON.stringify(channelList), function (err) {
      if (err) {
        logger.system().error(__filename, '写入 SOURCE 失败', err);
        return res.status(400).end();
      }

      res.status(204).end();
    });
  });
};

/**
 * 删除频道
 * @param {Object} req
 *        {MongoId} req.body._id
 * @param {Object} res
 */
exports.remove = function (req, res) {
  req.checkParams({
    '_id': {
      notEmpty: {
        options: [true],
        errorMessage: '_id 不能为空'
      }
    }
  });

  if (req.validationErrors()) {
    logger.system().error(__filename, '参数验证失败', req.validationErrors());
    return res.status(400).end();
  }

  var _id = req.params._id;

  switch (_id.length) {
    case 1:
      _id = '00' + _id;

      break;
    case 2:
      _id = '0' + _id;
  }

  fs.readFile(path.join(__dirname,'../../config/stream.json'), function (err, data) {
    if (err) {
      logger.system().error(__filename, '获取 Stream 失败', err);
      return res.status(400).end();
    }

    var stream = JSON.parse(data);
    var newStream = _.reject(stream, { name: _id });

    fs.writeFile(path.join(__dirname,'../../config/stream.json'), JSON.stringify(newStream), function (err) {
      if (err) {
        logger.system().error(__filename, '写入 Stream 失败', err);
        return res.status(400).end();
      }

      res.status(204).end();
    });
  });
};