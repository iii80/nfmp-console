var os = require('os');
var _ = require('lodash');
var logger = require('../../lib/logger.lib');
var exec = require('child_process').exec;

var networkSource = [];

// var source = 'eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n' +
//   '        inet 10.44.31.227  netmask 255.255.248.0  broadcast 10.44.31.255\n' +
//   '        ether 00:16:3e:00:51:2b  txqueuelen 1000  (Ethernet)\n' +
//   '        RX packets 27812547  bytes 9242168569 (8.6 GiB)\n' +
//   '        RX errors 0  dropped 0  overruns 0  frame 0\n' +
//   '        TX packets 28297115  bytes 2203048095 (2.0 GiB)\n' +
//   '        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0\n' +
//   '\n' +
//   'eth1: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n' +
//   '        inet 101.200.138.187  netmask 255.255.252.0  broadcast 101.200.139.255\n' +
//   '        ether 00:16:3e:00:2f:d5  txqueuelen 1000  (Ethernet)\n' +
//   '        RX packets 312690176  bytes 85413169225 (79.5 GiB)\n' +
//   '        RX errors 0  dropped 2  overruns 0  frame 0\n' +
//   '        TX packets 316402088  bytes 97799193856 (91.0 GiB)\n' +
//   '        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0\n' +
//   '\n' +
//   'lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536\n' +
//   '        inet 127.0.0.1  netmask 255.0.0.0\n' +
//   '        loop  txqueuelen 0  (Local Loopback)\n' +
//   '        RX packets 100581747  bytes 78168523862 (72.8 GiB)\n' +
//   '        RX errors 0  dropped 0  overruns 0  frame 0\n' +
//   '        TX packets 100581747  bytes 78168523862 (72.8 GiB)\n' +
//   '        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0';

exec('ifconfig', function (err, stdout, stderr) {
  if (err) {
    logger.system().error(__filename, '打印网卡信息失败', err);
    return false;
  }

  var source = stdout.toString();

  _.map(source.match(/\w+(?:\: )/mg), function (item) {
    var name = item.replace(': ', '');

    networkSource.push({
      name: item.replace(': ', '')
    });
  });

  _.map(source.match(/inet ([\d|\.]+)/mg), function (item, index) {
    networkSource[index].address = item.replace('inet ', '');
  });

  _.map(source.match(/ether ([\w|\:]+)/mg), function (item, index) {
    networkSource[index].mac = item.replace('ether ', '');
  });

  _.map(source.match(/netmask ([\w|\.]+)/mg), function (item, index) {
    networkSource[index].netmask = item.replace('netmask ', '');
  });

  // _.map(source.match(/broadcast ([\w|\.]+)/mg), function (item, index) {
  //   networkSource[index].gw = item.replace('broadcast ', '');
  // });
});

/**
 * 网络列表
 * @param {Object} req
 * @param {Object} res
 */
exports.list = function (req, res) {
  var nodeNetwork = os.networkInterfaces();

  var networkActive = [];

  _.forEach(nodeNetwork, function (item, key) {
    _.forEach(item, function (_item, _key) {
      if (_item.family === 'IPv4') {
        networkActive.push(key);
      }
    });
  });

  networkSource = _.map(networkSource, function (item) {
    if (_.includes(networkActive, item.name)) {
      item.active = true;
    } else {
      item.active = false;
    }

    return item;
  });

  res.status(200).json(networkSource);
};



/**
 * 更改网卡
 * @param {Object} req
 * @param {Object} res
 */
exports.change = function (req, res) {
  req.checkParams({
    'network': {
      notEmpty: {
        options: [true],
        errorMessage: 'network 不能为空'
      }
    }
  });
  req.checkBody({
    'address': {
      notEmpty: {
        options: [true],
        errorMessage: 'address 不能为空'
      },
      isString: { errorMessage: 'address 需为字符串' }
    },
    'netmask': {
      notEmpty: {
        options: [true],
        errorMessage: 'netmask 不能为空'
      },
      isString: { errorMessage: 'netmask 需为字符串' }
    },
    // 'gw': {
    //   optional: true,
    //   isString: { errorMessage: 'gw 需为字符串' }
    // },
    'toggle': {
      optional: true,
      isBoolean: { errorMessage: 'toggle 需为字符串' }
    }
  });

  if (req.validationErrors()) {
    logger.system().error(__filename, '参数验证失败', req.validationErrors());
    return res.status(400).end();
  }

  if (_.has(req.body, 'toggle')) {
    if (req.body.toggle === true) {
      exec('ifconfig ' + req.params.network + ' up', function (err, stdout, stderr) {
        if (err) {
          logger.system().error(__filename, '启动网卡' + req.params.network + '失败', err);
          return res.status(400).end();
        }

        res.status(204).end();
      });
    } else {
      exec('ifconfig ' + req.params.network + ' down', function (err, stdout, stderr) {
        if (err) {
          logger.system().error(__filename, '禁止网卡' + req.params.network + '失败', err);
          return res.status(400).end();
        }

        res.status(204).end();
      });
    }
  } else {
    var cmd = '';

    // if (_.has(req.body, 'gw')) {
    //   cmd = 'ifconfig ' + req.params.network + ' ' + req.body.address + ' netmask ' + req.body.netmask + ' gw ' + req.body.gw;
    // } else {
    //   cmd = 'ifconfig ' + req.params.network + ' ' + req.body.address + ' netmask ' + req.body.netmask;
    // }

    cmd = 'ifconfig ' + req.params.network + ' ' + req.body.address + ' netmask ' + req.body.netmask;

    exec(cmd, function (err, stdout, stderr) {
      if (err) {
        logger.system().error(__filename, '配置网卡' + req.params.network + '失败', err);
        return res.status(400).end();
      }

      res.status(204).end();
    });
  }
};