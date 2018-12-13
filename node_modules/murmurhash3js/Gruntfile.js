module.exports = function(grunt) {
    'use strict';

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify: {
            options: {
                banner: '/* <%= pkg.name %> v<%= pkg.version %> MIT License\n' +
                        '(c) 2012-<%= grunt.template.today("yyyy") %> <%= pkg.author.name %> \n' +
                        'Maintainer: <%= pkg.contributors[0].name %> <%= pkg.homepage %> */\n',
                max_line_length: 500
            },
            build: {
                src: '<%= buildSourceFile %>',
                dest: '<%= pkg.name %>.min.js'
            }
        },

        jshint: {
            options: {},
            src: ['Gruntfile.js', '<%= sourceFiles %>', '<%= jsonFiles %>']
        },

        watch: {
            files: ['Gruntfile.js', 'lib/**/*.js', 'test/**/*.js', 'package.json'],
            tasks: ['jshint', 'mocha', 'uglify']
        },

        bumpup: ['package.json', 'bower.json'],

        release: {
            options: {
                bump: false, //default: true
                tagName: 'v<%= version %>', //default: '<%= version %>'
                commitMessage: 'release v<%= version %>', //default: 'release <%= version %>'
                tagMessage: 'tagging version v<%= version %>' //default: 'Version <%= version %>'
            }
        },

        replace: {
            files: {
                src: '<%= buildSourceFile %>',
                overwrite: true,
                replacements: [{
                    from: /'version': '\d{1,2}\.\d{1,3}\.\d{1,4}',/g,
                    to: "'version': '<%= pkg.version %>',"
                }, {
                    from: /murmurHash3js.js v\d{1,2}\.\d{1,3}\.\d{1,3}/g,
                    to: "murmurHash3js.js v<%= pkg.version %>"
                }]
            },
            readme: {
                src: 'README.md',
                overwrite: true,
                replacements: [{
                    from: /"\d{1,2}\.\d{1,3}\.\d{1,4}" \/\/ get version/g,
                    to: "\"<%= pkg.version %>\" \/\/ get version"
                }]
            }
        },

        // files
        buildSourceFile: 'lib/murmurHash3js.js ',
        sourceFiles: 'lib/**/*.js ',
        testFiles: 'test/**/*.js ',
        jsonFiles: '*.json '
    });

    grunt.registerTask('mocha', 'run mocha', function() {
        var done = this.async();
        require('child_process')
            .exec('npm test', function(err, stdout) {
                grunt.log.write(stdout);
                done(err);
            });
    });

    grunt.event.on('watch ', function(action, filepath) {
        grunt.log.writeln(filepath + ' has ' + action);
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-release');
    grunt.loadNpmTasks('grunt-bumpup');
    grunt.loadNpmTasks('grunt-text-replace');

    // Default task(s).
    grunt.registerTask('default', ['replace', 'jshint', 'mocha', 'uglify']);

};
