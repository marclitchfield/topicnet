module.exports = function(grunt) {

	var lintFiles = ['**/*.js', '!node_modules/**', '!public/js/vendor/**', '!public/js/dist/**'];

	// Project configuration.
	grunt.initConfig({
		jshint: {
			all: lintFiles,
			options: {
				trailing: true,
				eqeqeq: true,
				curly: true,
				camelcase: true,
				latedef: true,
				newcap: true
			}
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
						'public/js/directives/*.js',
						'public/js/services/*.js'
					]
				}
			},
			vendor: {
				files: {
					'public/js/dist/vendor.min.js': [
						'public/js/vendor/angular-dragdrop.js',
						'public/js/vendor/bootstrap.js',
						'public/js/vendor/underscore-min.js',
						'public/js/vendor/modal-responsive-fix.js',
						'public/js/vendor/sha256.js'
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
		develop: {
			server: {
				file: 'service/server.js',
				disableOutput: true,
				readyText: 'Listening on'
			}
		},
		mochaTest: {
			backend: ['test/service/**/*.js']
		},
		mochaTestConfig: {
			backend: {
				options: {
					reporter: 'spec',
					timeout: 3000,
					grep: grunt.option('grep')
				}
			}
		},
		watch: {
			frontend: {
				files: ['Gruntfile.js', 'public/js/**/*.js', 'test/public/**/*.js', '!public/js/dist/**'],
				tasks: ['jshint', 'clean', 'uglify', 'jasmine']
			},
			backend: {
				files: ['Gruntfile.js', 'service/**/**.js', 'test/service/**/*.js'],
				tasks: ['jshint', 'clean', 'uglify', 'backend-tests']
			},
			lint: {
				files: lintFiles,
				tasks: ['jshint']
			}
		}
	});

	// Default task.
	grunt.registerTask('frontend-tests', ['jshint', 'clean', 'uglify', 'jasmine']);
	grunt.registerTask('backend-tests', ['develop', 'mochaTest', 'develop-kill']);
	grunt.registerTask('default', ['frontend-tests', 'backend-tests']);
	grunt.registerTask('ft', ['frontend-tests']);
	grunt.registerTask('bt', ['backend-tests']);
	grunt.registerTask('develop', ['develop']);

	grunt.registerTask('develop-kill', function() {
		grunt.event.emit('develop.kill');
	});
	
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.loadNpmTasks('grunt-develop');
	grunt.loadNpmTasks('grunt-mocha-test');
};
