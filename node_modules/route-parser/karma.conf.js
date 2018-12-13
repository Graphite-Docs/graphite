/*jshint maxlen:120 */
// Karma configuration
// Generated on Sat Feb 15 2014 18:21:16 GMT-0800 (PST)
'use strict';

module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '',


    // frameworks to use
    frameworks: ['mocha'],


    // list of files / patterns to load in the browser
    files: [
      'node_modules/es5-shim/es5-shim.js',
      'test/**/*.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress'],
    preprocessors: {
      '**/*.js': ['webpack']
    },


    webpack: {
      cache: true,
      module: {
        loaders: [
          // { test: /\.coffee$/, loader: 'coffee-loader' }
        ]
      }
    },

    webpackServer: {
      stats: {
        colors: true
      }
    },



    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_DEBUG,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera (has to be installed with `npm install karma-opera-launcher`)
    // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
    // - PhantomJS
    // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
    browsers: ['PhantomJS'],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    plugins: [
      'karma-webpack',
      'karma-mocha',
      'karma-phantomjs-launcher'
    ]
  });
};
