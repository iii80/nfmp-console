var path = require('path');

/**
 * 首页
 * @param {Object} req
 * @param {Object} res
 */
module.exports = function (req, res) {
  res.sendFile('home.html', { root: path.join(__dirname,'../../public/assets/') });
};