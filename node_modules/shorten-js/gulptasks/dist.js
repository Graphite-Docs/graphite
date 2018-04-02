/* jshint node: true */
'use strict';

var gulp = require('gulp'),
    g = require('gulp-load-plugins')({
        lazy: false
    }),
    version = require('../package.json').version,
    mainBowerFiles = require('main-bower-files');

gulp.task('js-dist',['clean-js'], function() {
  return gulp.src(['bower_components/hashids/lib/hashids.min.js', 'src/index.js'])
    .pipe(g.concat('shorten.js'))
    .pipe(g.replace('{{version}}', version))
    .pipe(gulp.dest('dist/' + version + '/'))
    .pipe(g.uglify({
        preserveComments: 'some'
    }))
    .pipe(g.rename('shorten.min.js'))
    .pipe(gulp.dest('dist/' + version + '/'))
    .pipe(gulp.dest('dist/latest/'))
    .pipe(g.gzip())
    .pipe(gulp.dest('dist/' + version + '/'))
    .pipe(g.cached('built-dist-js'));
});