"use strict";

module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        browserify: {
            options: {
                standalone: 'SJJ'
            },
            dist: {
                files: {
                    'build/<%= pkg.name %>.bundle.js': ['<%= pkg.main %>']
                }
            }
        },
        uglify: {
            dist: {
                files: {
                    'build/<%= pkg.name %>.bundle.min.js': ['build/<%= pkg.name %>.bundle.js']
                }
            }
        },
        jshint: {
            files: ['Gruntfile.js', 'index.js', 'lib/**.js', 'test/**.js'],
            options: grunt.file.readJSON('.jshintrc')
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('default', ['jshint', 'browserify', 'uglify']);
};
