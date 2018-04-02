/* jshint node: true */
'use strict';

var gulp = require('gulp'),
    browserSync = require('browser-sync');


gulp.task('reload', ['js-dev'], function() {
    return browserSync.reload();
});

gulp.task('serve', ['build'], function() {
    return browserSync({
        open: false,
        notify: false,
        server: {
            baseDir: ['.build', 'tests']
        }
    });
});

gulp.task('watch', function() {
    return gulp.watch(
        ['src/*.js'], ['reload']);
});

