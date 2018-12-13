# joi-browser

joi object schema validation bundled for the browser (babelified and bundled)

[![Build Status](https://secure.travis-ci.org/jeffbski/joi-browser.png?branch=master)](http://travis-ci.org/jeffbski/joi-browser) [![NPM Version Badge](https://img.shields.io/npm/v/joi-browser.svg)](https://www.npmjs.com/package/joi-browser)

## Why?

There has been some difficulty in getting a reasonable version of [Joi](https://github.com/hapijs/joi) packaged for the browser both due to the size of bundling and now with 7.x.x the switch to ES6 modules has added additional challenges.

The community is trying to rally to get the Joi package itself setup so that we can generate bundles directly from it, but until this is done, this package will allow you to build a bundled version.

This package can be used included in other builds (browserify or webpack) or used on its own.

The default version exposed by package.json is the babelified unminified bundle. It has been transpiled to ES5. Since I expected to primarily be using this inside of another bundle. However the minified version is also built on install as dist/bundle.min.js.

## Usage


```bash
npm install joi-browser
```

```javascript
var Joi = require('joi-browser');
```

Note: Joi uses the new ES6 features, Promise and Map, so you may need to add polyfills to use with older browsers.

 - To see what browsers support Promise: http://caniuse.com/#search=PROMISE
 - To check what browsers support Map: http://caniuse.com/#search=MAP

Include the polyfill early in your code before requiring Joi. You can use the parts of `core-js` for the polyfill or use packages `es6-promise` + `es6-map`.

npm install core-js or es6-promise and es6-map
```bash
npm install core-js
```

```js
require('core-js/fn/map'); // sets up global Map
require('core-js/fn/promise'); // sets up global Promise
```

Note: if you are using webpack with a babel loader you may need to exclude `joi-browser` from being run through babel again.

In your webpack.config.js loaders, add an `exclude: [ /joi-browser/ ]`


### Isomorphic / Universal JS - using in browser and on server (Node.js)

If you want to use `joi` with Node.js and `joi-browser` for browser use then you can follow one of these recipies.

#### Browserify

```bash
npm install joi-browser
npm install joi
```

Add the following to your app's package.json which will tell browserify to use joi-browser instead of joi when bundling for the browser.

```json
  "browser": {
    "joi": "joi-browser"
  },
```

So in your code, you just require `joi` and browserify will automatically switch it with joi-browser when it bundles.

```javascript
var Joi = require('joi');
```

See `examples/browserify-basic`

#### Webpack

```bash
npm install joi-browser
npm install joi
```

Add the following to your app's webpack.config.js to alias joi to joi-browser

```javascript
  resolve: {
    alias: {
      joi: 'joi-browser'
  }
```

Note: if you are using webpack with a babel loader you may need to exclude `joi-browser` (or node_modules) from being run through babel again.

In your webpack.config.js loaders, add an `exclude: [ /joi-browser/ ]`.



So in your code, you just require `joi` and webpack will automatically switch it with joi-browser when it bundles.

```javascript
var Joi = require('joi');
```

See `examples/webpack-basic`

## joi-full

joi@10 moved some date validation logic into an extension `joi-date-extensions` so I built the equivalent [joi-date-extensions-browser](https://github.com/jeffbski/joi-date-extensions-browser) but there are currently issues with the build when trying to integrate `joi-browser` and `joi-date-extensions-browser`.

As an alternative, I created [joi-full](https://github.com/jeffbski/joi-full) which is a universal/isomorphic version of joi that includes extensions (namely joi-date-extensions). It can be used for Node.js or in the browser by bundling with webpack or browserify. Since `joi-full` already bundles both `joi` and `joi-date-extensions` it works around the build issue previously encountered.


## Development

```bash
# builds dist/joi-browser.js and dist/joi-browser.min.js
npm install
npm run prepublish # when you want to rebuild
```

### Examples

I have included a few examples of demonstrating how to use with webpack and browserify

 - `examples/browserify-basic`
 - `examples/webpack-basic`

## Upgrade notes

See the [github releases for notes](https://github.com/jeffbski/joi-browser/releases). A few notable upgrades are:

 - 13.0.1 - Updated to joi@13.0.1 and updated build tools (webpack@2.7.0, karma@2.0.5). Buffer is now included. Using ChromeHeadless for tests.

 - 10.0.5 - Joi split momentjs date format functionality into `joi-date-extensions`. The equivalent version for the browser is [joi-date-extensions-browser](https://github.com/jeffbski/joi-date-extensions-browser), but there are building issues. You can instead use [joi-full](https://github.com/jeffbski/joi-full) which includes the extension and is a universal/isomorphic package that will work in either Node.js or bundled with webpack/browserify. If you install `joi-full` you will need to also install its peer dependency `moment`. See [joi-full](https://github.com/jeffbski/joi-full) for all the details.

 - 7.1.0 - excludes `moment` from the `joi-browser` bundle, so it must be imported into your project from elsewhere. Bundle was renamed to `dist/joi-browser.js` and `dist/joi-browser.min.js`

## Discussion

The main discussion about these difficulties has been in this github issue.

https://github.com/hapijs/joi/issues/528#issuecomment-128532221

As for the bundling size issues that were summarized in the issue, the package size can be reduced by eliminating unnecessary code.

crypto is the first thing that can be safely eliminated since this functionaility in Joi would not be used by the browser. That is the biggest win dropping things to ~45KB gzipped without sacrificing any actual functionality.

If your use case doesn't require moment, isemail, and buffer, you can stub those packages out and get a bundle in the neighborhood of ~23KB gzipped.

I have chosen to make the default bundle only exclude crypto so that it would remain fully compatible, but you could fork this and create a smaller version by excluding things you don't need.

| Config | Joi and dependencies gzipped |
|----------|------------------------------------------|
| Full Joi | 126KB |
| w/o crypto (in Hoek) | 44KB |
| w/o crypto (in Hoek), moment | 31KB |
| w/o crypto (in Hoek), moment, isemail | 29KB |
| w/o crypto (in Hoek), moment, isemail, buffer | 23KB |
