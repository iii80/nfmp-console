var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var spawn = require('child_process').spawn;
var server = null;

/**
 * 检查 Stream 是否激活
 * @param {String} id
 * @param {String} callback
 */
function checkActive(id, callback) {
  callback = callback || function () {};

  fs.readFile(path.join(__dirname,'../../config/streams.json'), function (err, data) {
    if (err && data) {
      err.type = 'system';
      err.message = '获取 Stream 失败';
      callback(err);
      return false;
    }

    var streamList = JSON.parse(data);

    var result = _.find(streamList, { id: id });

    var active = result.pid ? true : false;

    callback(active);
  });
}

/**
 * 写入PID到文件
 * @param {String} id
 * @param {String} pid
 * @param {String} callback
 */
function writePid (id, pid, callback) {
  callback = callback || function () {};

  fs.readFile(path.join(__dirname,'../../config/streams.json'), function (err, data) {
    if (err && data) {
      err.type = 'system';
      err.message = '获取 Stream 失败';
      callback(err);
      return false;
    }

    var streamList = JSON.parse(data);

    var result = _.find(streamList, { id: id });

    _.pull(streamList, result);

    result.pid = pid;

    streamList.push(result);

    fs.writeFile(path.join(__dirname,'../../config/streams.json'), JSON.stringify(streamList), function (err) {
      if (err) {
        err.type = 'system';
        err.message = '写入 Stream 失败';
        callback(err);
        return false;
      }

      callback();
    });
  });
}

/**
 * 运行命令
 * @param {String} 转码ID
 * @param {String} 命令
 * @param {String} callback
 */
exports.runCMD = function (id, cmd, callback) {
  callback = callback || function () {};

  function startServer() {
    server = spawn(cmd[0], cmd[1]);

    writePid(id, server.pid, callback);

    function restart(signal) {
      if (!signal) {
        return false;
      }

      server.kill(signal);

      setTimeout(function () {
        checkActive(id, function (active) {
          if (active) server = startServer(id, cmd);
        });
      }, 3000);
    }

    server.stderr.on('data', function (data) {
      console.log(data.toString());
    });

    server.on('close',function(code, signal){
      console.log('close', code, signal);
      restart(signal);
    });

    server.on('error',function(code, signal){
      console.log('error', code, signal);
      restart(signal);
    });
  }; startServer();
};