'use strict';
var gulp = require('gulp'),
    childProcess = require('child_process'),
    jshint = require('gulp-jshint');


var realCodePaths = [
  '**/*.{js,jsx,coffee}',
  '!node_modules/**',
  '!lib/route/compiled-grammar.js',
  '!coverage/**',
  '!docs/**'
];

gulp.task('lint', function() {
  gulp.src(realCodePaths)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('jsdoc', function() {
  childProcess.exec(
    './node_modules/.bin/jsdoc -c jsdoc.json',
    function(error,stdout,stderr) {
      console.log(stdout);
      console.error(stderr);
    }
  );
});

gulp.task('default',function() {
  gulp.watch(realCodePaths, ['lint','jsdoc']);
});

