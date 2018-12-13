/* Copyright 2014 Open Ag Data Alliance
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');

var files = ['gulpfile.js', 'rsa-pem-to-jwk.js', 'test/**/*.js'];

gulp.task('default', ['lint', 'style', 'watch']);

gulp.task('lint', function() {
  return gulp.src(files)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('style', function() {
  return gulp.src(files)
    .pipe(jscs());
});

gulp.task('watch', function() {
  gulp.watch(files, ['lint', 'style']);
});
