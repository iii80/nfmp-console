var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var logger = require('../../lib/logger.lib');

/**
 * 频道信息
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

  fs.readFile(path.join(__dirname,'../../config/sources.json'), function (err, data) {
    if (err && data) {
      logger.system().error(__filename, '获取 SOURCE 失败', err);
      return res.status(400).end();
    }

    if (!data) {
      return res.status(200).json([]);
    }

    var channel = JSON.parse(data);
    var item = _.find(channel, { name: _id });

    item.source = item.source.replace(' live=1', '');

    res.status(200).json(item);
  });
};

/**
 * 频道列表
 * @param {Object} req
 * @param {Object} res
 */
exports.list = function (req, res) {
  fs.readFile(path.join(__dirname,'../../config/sources.json'), function (err, data) {
    if (err && data) {
      logger.system().error(__filename, '获取 SOURCE 失败', err);
      return res.status(400).end();
    }

    if (!data) {
      return res.status(200).json([]);
    }

    var channelList = JSON.parse(data);

    _.map(channelList, function (item) {
      var pre = item.source.match(/^(\w+)\:\/\//);

      if (_.get(pre, '[1]') === 'rtmp') {
        item.source = item.source.replace(' live=1', '');
      }
    });

    res.status(200).json(channelList);
  });
};

/**
 * 创建频道
 * @param {Object} req
 *        {String} req.body.url
 *        {String} req.body.source
 *        {String} req.body.remark
 * @param {Object} res
 */
exports.create = function (req, res) {
  req.checkBody({
    'url': {
      notEmpty: {
        options: [true],
        errorMessage: 'url 不能为空'
      },
      isString: { errorMessage: 'url 需为字符串' }
    },
    'source': {
      notEmpty: {
        options: [true],
        errorMessage: 'source 不能为空'
      },
      isString: { errorMessage: 'source 需为字符串' }
    },
    'remark': {
      optional: true,
      isString: { errorMessage: 'remark 需为字符串' }
    }
  });

  if (req.validationErrors()) {
    logger.system().error(__filename, '参数验证失败', req.validationErrors() );
    return res.status(400).end();
  }

  var newChannel = {
    url: req.body.url,
    source: req.body.source,
    remark: req.body.remark,
    provider: "wephd.net"
  };

  var pre = newChannel.source.match(/^(\w+)\:\/\//);

  if (_.get(pre, '[1]') === 'rtmp') {
    newChannel.source = newChannel.source + ' live=1'
  }

  fs.readFile(path.join(__dirname,'../../config/sources.json'), function (err, data) {
    if (err && data) {
      logger.system().error(__filename, '获取 SOURCE 失败', err);
      return res.status(400).end();
    }

    var channelList;

    if (!data) {
      channelList = [];

      newChannel.name = '001';
    } else {
      channelList = JSON.parse(data);

      var _id = (Number(_.sortBy(channelList, 'name')[channelList.length - 1].name) + 1) + '';

      switch (_id.length) {
        case 1:
          _id = '00' + _id;

          break;
        case 2:
          _id = '0' + _id;
      }

      newChannel.name = _id;
    }

    channelList.push(newChannel);

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
    'url': {
      notEmpty: {
        options: [true],
        errorMessage: 'url 不能为空'
      },
      isString: { errorMessage: 'url 需为字符串' }
    },
    'source': {
      notEmpty: {
        options: [true],
        errorMessage: 'source 不能为空'
      },
      isString: { errorMessage: 'source 需为字符串' }
    },
    'remark': {
      optional: true,
      isString: { errorMessage: 'remark 需为字符串' }
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

  var newChannel = {
    url: req.body.url,
    source: req.body.source,
    remark: req.body.remark,
    provider: "wephd.net"
  };

  var pre = newChannel.source.match(/^(\w+)\:\/\//);

  if (_.get(pre, '[1]') === 'rtmp') {
    newChannel.source = newChannel.source + ' live=1'
  }

  fs.readFile(path.join(__dirname,'../../config/sources.json'), function (err, data) {
    if (err) {
      logger.system().error(__filename, '获取 SOURCE 失败', err);
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

  fs.readFile(path.join(__dirname,'../../config/sources.json'), function (err, data) {
    if (err) {
      logger.system().error(__filename, '获取 SOURCE 失败', err);
      return res.status(400).end();
    }

    var channel = JSON.parse(data);
    var newChannel = _.reject(channel, { name: _id });

    fs.writeFile(path.join(__dirname,'../../config/sources.json'), JSON.stringify(newChannel), function (err) {
      if (err) {
        logger.system().error(__filename, '写入 SOURCE 失败', err);
        return res.status(400).end();
      }

      res.status(204).end();
    });
  });
};