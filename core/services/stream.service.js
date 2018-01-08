var path = require('path');
var _ = require('lodash');
var spawn = require('child_process').spawn;
var server = null;
var localStorage = require('../../lib/localStorage.lib');

/**
 * 检查 Stream 是否激活
 * @param {String} id
 * @param {String} callback
 */
function checkActive(id, callback) {
  callback = callback || function () {};

  var streams = localStorage.getItem('streams');

  if (!streams) streams = [];

  var streamList = JSON.parse(data);

  var result = _.find(streamList, { id: id });

  var active = result.pid ? true : false;

  callback(active);
}

/**
 * 写入PID到文件
 * @param {String} id
 * @param {String} pid
 * @param {String} callback
 */
function writePid (id, pid, callback) {
  callback = callback || function () {};

  var streams = localStorage.getItem('streams');

  if (!streams) streams = [];

  var streamList = JSON.parse(streams);

  var result = _.find(streamList, { id: id });

  _.pull(streamList, result);

  result.pid = pid;

  streamList.push(result);

  localStorage.setItem('streams', JSON.stringify(streamList));

  callback();
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

    function restart() {
      setTimeout(function () {
        checkActive(id, function (active) {
          if (active) server = startServer(id, cmd);
        });
      }, 3000);
    }

    server.stdout.on('data', function (data) {
      console.log(data.toString());
    });

    server.stderr.on('data', function (data) {
      console.log(data.toString());
    });

    server.on('close',function(code){
      console.log('子进程Close：' + code);

      restart();
    });

    server.on('error',function(code, signal){
      console.log('子进程Error：' + code, signal);

      server.kill(signal);
      restart();
    });
  }; startServer();
};