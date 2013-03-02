module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		jshint: {
			frontend: ['public/*.js', 'public/directives/**/*.js', 'public/controllers/**/*.js'],
			backend: ['server.js', 'lib/**/*.js']
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
		exec: {
			'start-test-server': {
				command: function() {
					process.env.NODE_ENV = 'test';
					return 'node server.js';
				},
				async: true
			},
			'start-dev-server': {
				command: function() {
					process.env.NODE_ENV = 'dev';
					return 'node server.js';
				}
			}
		},
		mochaTest: {
			backend: ['test/**/*.js', '!test/public/**/*.js']				
		},
		mochaTestConfig: {
			backend: {
				options: {
					reporter: 'spec',
					timeout: 3000
				}			
			}
		},
		watch: {
			frontend: {
				files: ['Gruntfile.js', 'public/js/**/*.js', 'test/public/**/*.js', '!public/js/dist/**/*.js'],
				tasks: ['jshint:frontend', 'clean', 'uglify', 'jasmine']
			},
			backend: {
				files: ['Gruntfile.js', 'server.js', 'lib/**/*.js', 'test/**/*.js', '!test/public/**/*.js'],
				tasks: ['jshint:backend', 'clean', 'uglify', 'backend-tests']
			}
		}
	});

	// Default task.
	grunt.registerTask('frontend-tests', ['jshint', 'clean', 'uglify', 'jasmine']);
	grunt.registerTask('backend-tests', ['exec:start-test-server', 'mochaTest']);
	grunt.registerTask('default', ['frontend-tests', 'backend-tests']);
	grunt.registerTask('ft', ['frontend-tests']);
	grunt.registerTask('bt', ['backend-tests']);
	
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.loadNpmTasks('grunt-exec');
	grunt.loadNpmTasks('grunt-mocha-test');
};
