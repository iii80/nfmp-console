var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var _ = require('lodash');
var async = require('async');
var exec = require('child_process').exec;
var logger = require('../../lib/logger.lib');
var networkService = require('../services/network.service');
var streamService = require('../services/stream.service');

/**
 * 转码信息
 * @param {Object} req
 *        {Object} req.body.id
 * @param {Object} res
 */
exports.one = function (req, res) {
  req.checkParams({
    'id': {
      notEmpty: {
        options: [true],
        errorMessage: 'id 不能为空'
      }
    }
  });

  if (req.validationErrors()) {
    logger.system().error(__filename, '参数验证失败', req.validationErrors());
    return res.status(400).end();
  }

  var id = req.params.id;

  fs.readFile(path.join(__dirname,'../../config/streams.json'), function (err, data) {
    if (err && data) {
      logger.system().error(__filename, '获取 Stream 失败', err);
      return res.status(400).end();
    }

    if (!data) {
      return res.status(200).json([]);
    }

    var stream = JSON.parse(data);
    var item = _.find(stream, { id: id });

    res.status(200).json(item);
  });
};

/**
 * 转码列表
 * @param {Object} req
 * @param {Object} res
 */
exports.list = function (req, res) {
  fs.readFile(path.join(__dirname,'../../config/streams.json'), function (err, data) {
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
 * 开关
 * @param {Object} req
 *        {String} req.body.id
 *        {String} req.body.active
 * @param {Object} res
 */
exports.switch = function (req, res) {
  req.checkBody({
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

  fs.readFile(path.join(__dirname,'../../config/streams.json'), function (err, data) {
    if (err && data) {
      logger.system().error(__filename, '获取 Stream 失败', err);
      res.status(400).end();
      return false;
    }

    var streamList = JSON.parse(data);

    var result = _.find(streamList, { id: req.body.id });

    _.pull(streamList, result);

    result.active = req.body.active;

    var _pid = result.pid;

    if (!result.active) {
      result.pid = '';
    }

    streamList.push(result);

    fs.writeFile(path.join(__dirname,'../../config/streams.json'), JSON.stringify(streamList), function (err) {
      if (err) {
        logger.system().error(__filename, '写入 Stream 失败', err);
        res.status(400).end();
        return false;
      }

      if (result.active) {
        streamService.runCMD(result.id, result.cmd);
      } else {
        exec('kill -s 9 ' + _pid);
      }

      res.status(204).end();
    });
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
    createCMD: ['mkdir', 'getNetwork', function (callback, results) {
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
    writeData: ['createCMD',  function (callback, results) {
      fs.readFile(path.join(__dirname,'../../config/streams.json'), function (err, data) {
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

          var id = (Number(_.sortBy(streamList, 'id')[streamList.length - 1].id) + 1) + '';

          switch (id.length) {
            case 1:
              id = '00' + id;

              break;
            case 2:
              id = '0' + id;
          }

          stream.id = id;
        }

        if (results.createCMD) {
          stream.active = true;
          stream.cmd = results.createCMD;
        } else {
          stream.active = false;
          stream.cmd = '';
        }

        streamList.push(stream);

        fs.writeFile(path.join(__dirname,'../../config/streams.json'), JSON.stringify(streamList), function (err) {
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
 * 更新转码
 * @param {Object} req
 *        {MongoId} req.body.id
 * @param {Object} res
 */
exports.update = function (req, res) {
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
    logger.system().error(__filename, '参数验证失败', req.validationErrors());
    return res.status(400).end();
  }

  var id = req.params.id;

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
    loadStreams: function (callback) {
      fs.readFile(path.join(__dirname,'../../config/streams.json'), function (err, data) {
        if (err && data) {
          err.type = 'system';
          err.message = '获取 Stream 失败';
          callback(err);
          return false;
        }

        var streamsList = JSON.parse(data);
        
        var oldStream = _.find(streamsList, { id: id });

        if (oldStream.pid) exec('kill -s 9 ' + oldStream.pid);

        callback(null, {
          streamsList: streamsList,
          oldStream: oldStream
        });
      });
    },
    moveDir: ['loadStreams', function (callback, results) {
      exec('mv ' + results.loadStreams.oldStream.name + ' ' + stream.name, function (err) {
        if (err) {
          err.type = 'system';
          err.message = 'MV文件夹失败';
          callback(err);
          return false;
        }

        callback();
      });
    }],
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
    createCMD: ['moveDir', 'getNetwork', function (callback, results) {
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
    writeData: ['createCMD',  function (callback, results) {
      var newStream = results.loadStreams.oldStream;

      if (results.createCMD) {
        newStream.active = true;
        newStream.cmd = results.createCMD;
      } else {
        newStream.active = false;
        newStream.cmd = '';
      }

      newStream.name = stream.name;
      newStream.url = stream.url;

      if (req.body.hls) {
        newStream.hls = stream.hls;
      }

      if (req.body.muhicast) {
        newStream.muhicast = stream.muhicast;
        newStream.network = stream.network;
        newStream.outUrl = stream.outUrl;
      }

      var newStreamList = results.loadStreams.streamsList;

      _.map(newStreamList, function (item) {
        if (item.name === id) {
          item = newStream;
        }
      });

      fs.writeFile(path.join(__dirname,'../../config/streams.json'), JSON.stringify(newStreamList), function (err) {
        if (err) {
          err.type = 'system';
          err.message = '写入 Stream 失败';
          callback(err);
          return false;
        }

        callback(null, stream.id);
      });
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
 * 删除频道
 * @param {Object} req
 *        {MongoId} req.body.id
 * @param {Object} res
 */
exports.remove = function (req, res) {
  req.checkParams({
    'id': {
      notEmpty: {
        options: [true],
        errorMessage: 'id 不能为空'
      }
    }
  });

  if (req.validationErrors()) {
    logger.system().error(__filename, '参数验证失败', req.validationErrors());
    return res.status(400).end();
  }

  fs.readFile(path.join(__dirname,'../../config/streams.json'), function (err, data) {
    if (err) {
      logger.system().error(__filename, '获取 Stream 失败', err);
      return res.status(400).end();
    }

    var stream = JSON.parse(data);
    var oldPid = _.find(stream, { name: id }).pid;
    var newStream = _.reject(stream, { name: id });

    if (oldPid) exec('kill -s 9 ' + oldPid);

    fs.writeFile(path.join(__dirname,'../../config/streams.json'), JSON.stringify(newStream), function (err) {
      if (err) {
        logger.system().error(__filename, '写入 Stream 失败', err);
        return res.status(400).end();
      }

      res.status(204).end();
    });
  });
};