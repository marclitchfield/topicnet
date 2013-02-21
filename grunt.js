module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		lint: {
			all: ['grunt.js', 'server.js', 'lib/**/*.js', 'public/*.js', 
				'public/directives/**/*.js', 'public/controllers/**/*.js']
		},
		clean: {
			folder: 'public/js/dist/*.*'
		},
		'jsmin-sourcemap': {
			app: {
				cwd: 'public/js',
				src: ['app.js', 'controllers/*.js', 'directives/*.js'],
				dest: 'dist/app.min.js',
				destMap: 'dist/app.min.js.map',
				srcRoot: '..'
			}
		},
		watch: {
			files: ['grunt.js', 'public/js/**/*.js'],
			tasks: ['jsmin-sourcemap']
		},
		jshint: {
			options: {
				browser: true
			}
		}
	});

	// Default task.
	grunt.registerTask('default', 'lint clean jsmin-sourcemap');
	
	grunt.loadNpmTasks('grunt-jsmin-sourcemap');
	grunt.loadNpmTasks('grunt-clean');
};