/* jshint node: true */
'use strict';

var gulp = require('gulp'),
    g = require('gulp-load-plugins')({
        lazy: false
    }),
    mainBowerFiles = require('main-bower-files');

gulp.task('js-dev', ['clean-js'], function() {
    return gulp.src(['bower_components/hashids/lib/hashids.min.js', 'src/index.js'])
        .pipe(g.concat('shorten.js'))
        .pipe(gulp.dest('.build/'));
});