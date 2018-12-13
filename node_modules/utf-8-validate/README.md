# utf-8-validate

[![Version npm](https://img.shields.io/npm/v/utf-8-validate.svg)](https://www.npmjs.com/package/utf-8-validate)
[![Build Status](https://travis-ci.org/websockets/utf-8-validate.svg?branch=master)](https://travis-ci.org/websockets/utf-8-validate)
[![Windows Build](https://ci.appveyor.com/api/projects/status/github/websockets/utf-8-validate?branch=master&svg=true)](https://ci.appveyor.com/project/lpinca/utf-8-validate)

WebSocket connections require extensive UTF-8 validation in order to conform to
the specification. This was unfortunately not possible in JavaScript, hence the
need for a binary addon.

As the module consists of binary components, it should be used as
`optionalDependency` so when installation fails, it doesn't halt the
installation of your module. There are fallback files available in this
repository. See `fallback.js` for the suggest fallback implementation if
installation fails.

## Installation

```
npm install utf-8-validate
```

## API

In all examples we assume that you've already required the mdoule as
follows:

```js
'use strict';

var validation = require('utf-8-validate').Validation;
```

The module exposes 1 function:

#### isValidUTF8

Validate if the passed in buffer contains valid UTF-8 chars.

```js
validation.isValidUTF8(buffer);
```

## License

[MIT](LICENSE)
