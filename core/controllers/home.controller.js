/**
 * 首页
 * @param {Object} req
 * @param {Object} res
 */
module.exports = function (req, res) {
  res.sendFile('home.html', { root: './public/assets/' });
};