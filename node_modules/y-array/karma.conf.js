// Karma configuration
// Generated on Tue May 03 2016 11:21:18 GMT+0200 (CEST)

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', 'browserify'],
    files: [
      'src/**/*.spec.js'
    ],
    preprocessors: {
      'src/**/*.spec.js': ['browserify']
    },
    browserify: {
      debug: true,
      transform: ['brfs']
    },
    reporters: ['kjhtml'],
    port: 9876,
    colors: true,
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    concurrency: Infinity
  })
}
