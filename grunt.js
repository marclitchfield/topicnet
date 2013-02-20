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
			controllers: {
				cwd: 'public/js/controllers',
				src: '*.js',
				dest: '../dist/controllers.min.js',
				destMap: '../dist/controllers.js.map',
				srcRoot: '/js/controllers'
			},
			directives: {
				cwd: 'public/js/directives',
				src: '*.js',
				dest: '../dist/directives.min.js',
				destMap: '../dist/directives.js.map',
				srcRoot: '/js/directives'
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