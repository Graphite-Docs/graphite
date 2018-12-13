/*!
 * Grunt file
 */

/* eslint-env node, es6 */

module.exports = function ( grunt ) {
	grunt.loadNpmTasks( 'grunt-eslint' );
	grunt.loadNpmTasks( 'grunt-stylelint' );

	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),
		eslint: {
			all: [
				'*.js'
			]
		},
		stylelint: {
			all: [
				'*.css'
			]
		},
		watch: {
			files: [
				'.{eslint.json}',
				'<%= eslint.all %>'
			],
			tasks: '_test'
		}
	} );

	grunt.registerTask( 'test', [ 'eslint', 'stylelint' ] );
	grunt.registerTask( 'default', 'test' );
};
