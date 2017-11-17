var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var spawn = require('child_process').spawn;
var server = null;

/**
 * 检查 Stream 是否激活
 * @param id
 * @param callback
 */
function checkActive(id, callback) {
  fs.readFile(path.join(__dirname,'../../config/stream.json'), function (err, data) {
    if (err && data) {
      err.type = 'system';
      err.message = '获取 Stream 失败';
      callback(err);
      return false;
    }

    var streamList = JSON.parse(data);

    var result = _.find(streamList, { id: id });

    callback(result.active);
  });
}

function writePid (id, pid, callback) {
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

    result.pid = pid;

    streamList.push(result);

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
}

/**
 * 运行命令
 * @callback {Object} 网卡列表
 */
exports.runCMD = function (id, cmd) {
  function startServer() {
    server = spawn(cmd[0], cmd[1]);

    writePid(id, server.pid);

    function restart(signal) {
      server.kill(signal);

      setTimeout(function () {
        checkActive(id, function (active) {
          if (active) server = startServer(id, cmd);
        });
      }, 3000);
    }

    server.on('close',function(code, signal){
      if (err) {
        err.type = 'system';
        err.message = 'Stream 进程 Close';
        callback(err);
        return false;
      }

      restart(signal);
    });

    server.on('error',function(code, signal){
      if (err) {
        err.type = 'system';
        err.message = 'Stream 进程 Error';
        callback(err);
        return false;
      }

      restart(signal);
    });
  }; startServer();
};