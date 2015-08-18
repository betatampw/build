module.exports = function (grunt) {
	'use struct';
	var fs = require('fs');

	var compileHandlebarsAr = [{
		src: [],
		dest: []
	}];
	var compileHandlebarsDataAr = [];
	var pageSettings = JSON.parse(fs.readFileSync('src/pagesSettings.json', 'utf8'));
	var pagesConcatObject = {};
	var pages = fs.readdirSync('src/pages/');


	pages.forEach(function (value) {
		var file = value.split('.');
		pagesConcatObject['build/'+value] = ['src/header.html', 'src/pages/'+value, 'src/footer.html'];
		compileHandlebarsAr[0].src.push('build/'+value);
		compileHandlebarsAr[0].dest.push('build/'+value);
		compileHandlebarsDataAr.push({"all":pageSettings['all'],"page":pageSettings[file[0]]});
	});


  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
		clean: ["build/*"],
		concat: {
			pages: {
				options: {
					separator: '\n',
				},
				files: pagesConcatObject
			},
			bootstrapjs: {
				options: {
					process: function(src, filepath) {
						if(filepath.indexOf('carousel.js')>=0){
							return '';
						}
						return src;
					},
				},
				files: {
					'build/js/bootstrap.js': ['bower_components/bootstrap-sass/assets/javascripts/bootstrap/*.js'],
				}
			}
		},
		'compile-handlebars': {
			anyArray: {
				files: compileHandlebarsAr,
				templateData: compileHandlebarsDataAr
			}
		},
		sass: {
			options: {
				noCache: true,
				sourcemap: 'none'
			},
			dist: {
				files: {
					'build/template_styles.css': 'src/template_styles.scss',
					'build/css/bootstrap.css': 'src/bootstrap.scss'
				}
			}
		},
		autoprefixer: {
			options: {
				browsers: [
					'Android >= <%= pkg.browsers.android %>',
					'Chrome >= <%= pkg.browsers.chrome %>',
					'Firefox >= <%= pkg.browsers.firefox %>',
					'Explorer >= <%= pkg.browsers.ie %>',
					'iOS >= <%= pkg.browsers.ios %>',
					'Opera >= <%= pkg.browsers.opera %>',
					'Safari >= <%= pkg.browsers.safari %>'
				]
			},
			dist: {
				src: ['build/template_styles.css']
			}
		},
		csscomb: {
			dist: {
				options: {
					config: '.csscomb.json'
				},
				files: {
					'build/template_styles.css': ['build/template_styles.css']
				}
			}
		},
		cssmin: {
			target: {
				files: [{
					expand: true,
					cwd: 'build/css',
					src: ['*.css', '!*.min.css'],
					dest: 'build/css',
					ext: '.min.css'
				}]
			}
		},
		uglify: {
			target: {
				files: [{
					expand: true,
					cwd: 'build/js',
					src: ['*.js', '!*.min.js'],
					dest: 'build/js',
					ext: '.min.js'
				}]
			}
		}
	});

  // Load the plugin.
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-compile-handlebars');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-csscomb');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');

  // Register tasks.
	grunt.registerTask('html', ['concat:pages','compile-handlebars']);
	grunt.registerTask('css', ['sass','autoprefixer','csscomb','cssmin']);
	grunt.registerTask('js', ['concat:bootstrapjs','uglify']);
  grunt.registerTask('default', ['clean','html','css','js']);
};
