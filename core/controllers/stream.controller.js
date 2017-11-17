var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var _ = require('lodash');
var async = require('async');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var logger = require('../../lib/logger.lib');
var networkService = require('../services/network.service');
var streamService = require('../services/stream.service');

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

  if (req.body.hls) {
    req.checkBody({
      'hls': {
        notEmpty: {
          options: [true],
          errorMessage: 'hls 不能为空'
        },
        isBoolean: { errorMessage: 'hls 需为Boolean' }
      }
    });
  }

  if (req.body.muhicast) {
    req.checkBody({
      'muhicast': {
        notEmpty: {
          options: [true],
          errorMessage: 'muhicast 不能为空'
        },
        isBoolean: { errorMessage: 'muhicast 需为Boolean' }
      },
      'network': {
        notEmpty: {
          options: [true],
          errorMessage: 'network 不能为空'
        },
        isString: { errorMessage: 'network 需为字符串' }
      },
      'outUrl': {
        notEmpty: {
          options: [true],
          errorMessage: 'outUrl 不能为空'
        },
        isString: { errorMessage: 'outUrl 需为字符串' }
      }
    });
  }

  if (req.validationErrors()) {
    logger.system().error(__filename, '参数验证失败', req.validationErrors() );
    return res.status(400).end();
  }

  var stream = {
    name: req.body.name,
    url: req.body.url
  };

  if (req.body.hls) {
    stream.hls = true;
  }

  if (req.body.muhicast) {
    stream.muhicast = true;
    stream.network = req.body.network;
    stream.outUrl = req.body.outUrl;
  }

  async.auto({
    mkdir: function (callback) {
      mkdirp(path.join(__dirname, '../../public/stream/' + stream.name), function (err) {
        if (err) err.type = 'system';

        callback(err);
      });
    },
    getNetwork: function (callback) {
      if (!stream.network) {
        callback();
        return false;
      }

      networkService.one(stream.network, function (err, result) {
        if (err) err.type = 'system';

        callback(err, result);
      });
    },
    writeData: ['createCMD',  function (callback, results) {
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

        stream.cmd = results.createCMD;

        if (results.createCMD) {
          stream.active = true;
          stream.cmd = results.runCMD;
        } else {
          stream.active = false;
          stream.cmd = null;
        }

        streamList.push(stream);

        fs.writeFile(path.join(__dirname,'../../config/stream.json'), JSON.stringify(streamList), function (err) {
          if (err) {
            err.type = 'system';
            err.message = '写入 Stream 失败';
            callback(err);
            return false;
          }

          callback(null, stream.id);
        });
      });
    }],
    createCMD: ['mkdir', 'getNetwork', 'writeData', function (callback, results) {
      var normal = ['-i', stream.url];
      var cmd = [];

      if (stream.muhicast && !stream.hls) {
        cmd = ['ffmpeg', normal.concat(['-vcodec', 'copy', '-acodec', 'copy', '-f', 'mpegts', '"' + stream.outUrl + '?localaddr=' + results.getNetwork.address + '"'])];
      } else if (!stream.muhicast && stream.hls) {
        cmd = ['ffmpeg', normal.concat(['-vcodec', 'copy', '-acodec', 'copy', '-f', 'hls', '-hls_list_size', '6', '-hls_wrap', '10', '-hls_time', '10', path.join(__dirname, '../../public/stream/' + stream.name  + '/1.m3u8')])];
      } else if (stream.muhicast && stream.hls) {
        cmd = ['ffmpeg', normal.concat(['-vcodec', 'copy', '-acodec', 'copy', '-f', 'hls', '-hls_list_size', '6', '-hls_wrap', '10', '-hls_time', '10', path.join(__dirname, '../../public/stream/' + stream.name  + '/1.m3u8'), '-vcodec', 'copy', '-acodec', 'copy', '-f', 'mpegts', '"' + stream.outUrl + '?localaddr=' + results.getNetwork.address + '"'])];
      } else if (!stream.muhicast && !stream.hls) {
        cmd = null;
      }

      callback(null, cmd);
    }],
    runCMD: ['createCMD', 'writeData', function (callback, results) {
      if (!results.createCMD) {
        callback();
        return false;
      }

      streamService.runCMD(results.writeData, results.createCMD);

      callback();
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
 * 开关
 * @param {Object} req
 *        {String} req.body.id
 *        {String} req.body.active
 * @param {Object} res
 */
exports.switch = function (req, res) {
  req.checkParams({
    'id': {
      notEmpty: {
        options: [true],
        errorMessage: 'id 不能为空'
      },
      isString: { errorMessage: 'id 需为字符串' }
    },
    'active': {
      notEmpty: {
        options: [true],
        errorMessage: 'active 不能为空'
      },
      isBoolean: { errorMessage: 'active 需为 boolean' }
    }
  });

  if (req.validationErrors()) {
    logger.system().error(__filename, '参数验证失败', req.validationErrors());
    return res.status(400).end();
  }

  fs.readFile(path.join(__dirname,'../../config/stream.json'), function (err, data) {
    if (err && data) {
      err.type = 'system';
      err.message = '获取 Stream 失败';
      callback(err);
      return false;
    }

    var streamList = JSON.parse(data);

    var result = _.find(streamList, { id: id });

    _.pull(streamList, result);

    result.active = req.body.active;

    streamList.push(result);

    fs.writeFile(path.join(__dirname,'../../config/stream.json'), JSON.stringify(streamList), function (err) {
      if (err) {
        logger.system().error(__filename, '写入 Stream 失败', err);
        return res.status(400).end();
      }

      if (result.active) {
        streamService.runCMD(result.id, result.cmd);
      } else {
        exec('kill -s 9 ' + result.pid);
      }

      res.status(204).end();
    });
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

    fs.writeFile(path.join(__dirname,'../../config/stream.json'), JSON.stringify(streamList), function (err) {
      if (err) {
        logger.system().error(__filename, '写入 Stream 失败', err);
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