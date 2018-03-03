'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _auth = require('./auth');

Object.keys(_auth).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _auth[key];
    }
  });
});

var _profiles = require('./profiles');

Object.keys(_profiles).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _profiles[key];
    }
  });
});

var _storage = require('./storage');

Object.keys(_storage).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _storage[key];
    }
  });
});

var _dids = require('./dids');

Object.defineProperty(exports, 'makeDIDFromAddress', {
  enumerable: true,
  get: function get() {
    return _dids.makeDIDFromAddress;
  }
});
Object.defineProperty(exports, 'makeDIDFromPublicKey', {
  enumerable: true,
  get: function get() {
    return _dids.makeDIDFromPublicKey;
  }
});
Object.defineProperty(exports, 'getDIDType', {
  enumerable: true,
  get: function get() {
    return _dids.getDIDType;
  }
});
Object.defineProperty(exports, 'getAddressFromDID', {
  enumerable: true,
  get: function get() {
    return _dids.getAddressFromDID;
  }
});

var _keys = require('./keys');

Object.defineProperty(exports, 'getEntropy', {
  enumerable: true,
  get: function get() {
    return _keys.getEntropy;
  }
});
Object.defineProperty(exports, 'makeECPrivateKey', {
  enumerable: true,
  get: function get() {
    return _keys.makeECPrivateKey;
  }
});
Object.defineProperty(exports, 'publicKeyToAddress', {
  enumerable: true,
  get: function get() {
    return _keys.publicKeyToAddress;
  }
});
Object.defineProperty(exports, 'getPublicKeyFromPrivate', {
  enumerable: true,
  get: function get() {
    return _keys.getPublicKeyFromPrivate;
  }
});

var _utils = require('./utils');

Object.defineProperty(exports, 'nextYear', {
  enumerable: true,
  get: function get() {
    return _utils.nextYear;
  }
});
Object.defineProperty(exports, 'nextMonth', {
  enumerable: true,
  get: function get() {
    return _utils.nextMonth;
  }
});
Object.defineProperty(exports, 'nextHour', {
  enumerable: true,
  get: function get() {
    return _utils.nextHour;
  }
});
Object.defineProperty(exports, 'makeUUID4', {
  enumerable: true,
  get: function get() {
    return _utils.makeUUID4;
  }
});
Object.defineProperty(exports, 'hasprop', {
  enumerable: true,
  get: function get() {
    return _utils.hasprop;
  }
});
Object.defineProperty(exports, 'updateQueryStringParameter', {
  enumerable: true,
  get: function get() {
    return _utils.updateQueryStringParameter;
  }
});
Object.defineProperty(exports, 'isLaterVersion', {
  enumerable: true,
  get: function get() {
    return _utils.isLaterVersion;
  }
});
Object.defineProperty(exports, 'isSameOriginAbsoluteUrl', {
  enumerable: true,
  get: function get() {
    return _utils.isSameOriginAbsoluteUrl;
  }
});

var _jsontokens = require('jsontokens');

Object.defineProperty(exports, 'decodeToken', {
  enumerable: true,
  get: function get() {
    return _jsontokens.decodeToken;
  }
});