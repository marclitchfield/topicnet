module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		jshint: {
			all: ['gruntfile.js', 'server.js', 'lib/**/*.js', 'public/*.js', 
				'public/directives/**/*.js', 'public/controllers/**/*.js']
		},
		clean: {
			folder: 'public/js/dist/*.*'
		},
		uglify: {
			app: {
				options: {
					sourceMap: 'public/js/dist/app.min.js.map',
					sourceMappingURL: '/js/dist/app.min.js.map',
					sourceMapPrefix: 2,
					sourceMapRoot: '/js',
					mangle: false
				},
				files:  {
					'public/js/dist/app.min.js': [
						'public/js/app.js', 
						'public/js/controllers/*.js', 
						'public/js/directives/*.js'
					]
				}
			}
		},
		jasmine: {
			app: {
				src: [
					'public/js/vendor/angular.js',
					'public/js/vendor/angular-mocks.js',
					'public/js/dist/app.min.js',
					'test/public/**/*.js'
				]
			}
		},
		watch: {
			files: ['gruntfile.js', 'public/js/**/*.js', 'test/public/**/*.js', '!public/js/dist/**/*.js'],
			tasks: ['jshint', 'clean', 'uglify', 'jasmine']
		}
	});

	// Default task.
	grunt.registerTask('default', ['jshint', 'clean', 'uglify', 'jasmine']);
	
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jasmine');
};