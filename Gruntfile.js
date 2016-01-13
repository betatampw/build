module.exports = function (grunt) {
	'use struct';
	require('time-grunt')(grunt);
	require('jit-grunt')(grunt);
	// TODO убрать все лишнее
	var fs = require('fs');
	var compileHandlebarsAr = [{
		src: [],
		dest: []
	}];
	var compileHandlebarsDataAr = [];
	var pagesData = JSON.parse(fs.readFileSync('src/pagesData.json', 'utf8'));
	var pages = fs.readdirSync('src/pages/');
	pages.forEach(function (value) {
		var file = value.split('.');
		compileHandlebarsAr[0].src.push('build/'+value);
		compileHandlebarsAr[0].dest.push('build/'+value);
		compileHandlebarsDataAr.push({"all":pagesData['all'],"page":pagesData[file[0]]});
	});

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
		clean: ["build/*"],
		concat: {
			pages: {
				options: {
					banner: grunt.file.read('src/header.html') + '\n',
					footer: '\n' + grunt.file.read('src/footer.html')
				},
				files: [{
					expand: true,
					cwd: 'src/pages/',
					src: '*.html',
					dest: 'build/'
				}]
			},
			bootstrapjs: {
				files: {
					'build/js/core/bootstrap.js': grunt.file.readJSON('src/bootstrap/bootstrap.json'),
				}
			}
		},
		'compile-handlebars': {
			pages: {
				files: compileHandlebarsAr,
				templateData: compileHandlebarsDataAr
			}
		},
		sass: {
			styles:{
				options: {
					noCache: true,
					sourcemap: 'none'
				},
				files: {
					'build/template_styles.css': 'src/styles.scss',
				}
			},
			bootstrap:{
				options: {
					noCache: true,
					sourcemap: 'none'
				},
				files: {
					'build/css/core/bootstrap.css': 'src/bootstrap/bootstrap.scss'
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
					cwd: 'build/css/',
					src: ['**/*.css', '!**/*.min.css'],
					dest: 'build/css/',
					ext: '.min.css',
					extDot: 'last'
				}]
			}
		},
		uglify: {
			target: {
				files: [{
					expand: true,
					cwd: 'build/js/',
					src: ['**/*.js', '!**/*.min.js'],
					dest: 'build/js/',
					ext: '.min.js',
					extDot: 'last'
				}]
			}
		},
		copy: {
			main: {
				files: [
					{expand: true, src: ['src/icons/*'], flatten: true, dest: 'build/icons/'},
					{expand: true, src: ['src/images/*'], flatten: true, dest: 'build/images/'}
				],
			},
			js: {
				files: [
					{expand: true, src: ['src/js/*'], flatten: true, dest: 'build/js/'},
					{expand: true, src: ['src/script.js'], flatten: true, dest: 'build/'},
					{expand: true, src: [
						'bower_components/jquery/dist/jquery.min.js',
						'bower_components/respond/dest/respond.min.js',
						'bower_components/modernizr/modernizr.js'
					], flatten: true, dest: 'build/js/core/', filter: 'isFile'}
				],
			},
			css: {
				files: [
					{expand: true, src: ['src/css/*'], flatten: true, dest: 'build/css/'}
				],
			}
		},
		includeSource: {
			options: {
				basePath: 'build',
				templates: {
					html: {
						js: '<script src="{filePath}"></script>',
						css: '<link rel="stylesheet" href="{filePath}" />',
					},
				}
			},
			myTarget: {
				files: [{
					expand: true,
					cwd: 'build/',
					src: '*.html',
					dest: 'build/',
					ext: '.html',
					extDot: 'last'
				}]
			}
		},
		
		connect: {
    	server: {
				options: {
					keepalive: true,
					base: 'build',
					livereload: true,
					open: true
				}
			}
  	},		
		watch: {
			html: {
				files: [
					"src/pages/*.html",
					"src/header.html",
					"src/footer.html",
					"src/pagesData.json"
				],
				tasks: ['html'],
			},
			mainCss: {
				files: [
					"src/template_styles/*.scss",
				],
				tasks: ['sass:styles'],	
			},
			reload: {
				files: [
					"build/**/*.*"
				],
				options: {
					livereload: true
				}
			}
		}
	});



  // Register tasks.
	grunt.registerTask('html', [
		'concat:pages',
		'compile-handlebars',
		'includeSource'
	]);
	grunt.registerTask('css', [
		'sass:styles',
		'sass:bootstrap',
		'autoprefixer',
		'copy:css',
		'csscomb',
		'cssmin'
	]);
	grunt.registerTask('js', [
		'concat:bootstrapjs',
		'copy:js',
		'uglify'
	]);
  grunt.registerTask('default', [
		'clean',
		'css',
		'js',
		'copy:main',
		'html'
	]);
};