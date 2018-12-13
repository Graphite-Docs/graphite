module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    jshint: {
      files: {
        src: [
          'index.js',
          'test.js'
        ]
      },
      options: {
        jshintrc: '.jshintrc'
      }
    }
  });

  grunt.registerTask('default', ['jshint']);
};
