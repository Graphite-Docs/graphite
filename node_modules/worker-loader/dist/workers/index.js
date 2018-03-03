'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getWorker = function getWorker(file, content, options) {
  var publicPath = options.publicPath ? JSON.stringify(options.publicPath) : '__webpack_public_path__';

  var publicWorkerPath = `${publicPath} + ${JSON.stringify(file)}`;

  if (options.inline) {
    var InlineWorkerPath = JSON.stringify(`!!${_path2.default.join(__dirname, 'InlineWorker.js')}`);

    var fallbackWorkerPath = options.fallback === false ? 'null' : publicWorkerPath;

    return `require(${InlineWorkerPath})(${JSON.stringify(content)}, ${fallbackWorkerPath})`;
  }

  return `new Worker(${publicWorkerPath})`;
}; /* eslint-disable multiline-ternary */
exports.default = getWorker;