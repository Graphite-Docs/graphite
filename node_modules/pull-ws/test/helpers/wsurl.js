var wsurl = require('wsurl');

module.exports = wsurl(typeof window != 'undefined' ? location.origin : 'http://localhost:3000');
