var path = require('path');
var LocalStorage = require('node-localstorage').LocalStorage;

localStorage = new LocalStorage(path.join(__dirname, './scratch'));

module.exports = localStorage;