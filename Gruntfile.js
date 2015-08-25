module.exports = function (grunt) {
	'use struct';

	// TODO убрать все лишнее
	var fs = require('fs');

	var compileHandlebarsAr = [{
		src: [],
		dest: []
	}];
	var compileHandlebarsDataAr = [];
	var pageSettings = JSON.parse(fs.readFileSync('src/pagesSettings.json', 'utf8'));
	var pages = fs.readdirSync('src/pages/');
	pages.forEach(function (value) {
		var file = value.split('.');
		compileHandlebarsAr[0].src.push('build/'+value);
		compileHandlebarsAr[0].dest.push('build/'+value);
		compileHandlebarsDataAr.push({"all":pageSettings['all'],"page":pageSettings[file[0]]});
	});

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
		pagesData: grunt.file.readJSON('src/pagesSettings.json'),
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
					'build/js/core/bootstrap.js': grunt.file.readJSON('src/core/bootstrap.json'),
				}
			}
		},
		'compile-handlebars': {
			pages: {
				/*files: compileHandlebarsAr,
				templateData: compileHandlebarsDataAr*/
				files: [{
					expand: true,
					cwd: 'build/',
					src: '*.html',
					dest: 'build/',
					ext: '.html'
				}],
				templateData: {'template':'<%= pagesData.all  %>',page:'<%= pagesData.*  %>'}
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
					'build/css/core/bootstrap.css': 'src/core/bootstrap.scss'
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
					cwd: 'build/css/core/',
					src: ['*.css', '!*.min.css'],
					dest: 'build/css/core/',
					ext: '.min.css'
				}]
			}
		},
		uglify: {
			target: {
				files: [{
					expand: true,
					cwd: 'build/js/core/',
					src: ['*.js', '!*.min.js'],
					dest: 'build/js/core/',
					ext: '.min.js'
				}]
			}
		},
		copy: {
			main: {
				files: [
					{expand: true, src: ['src/icons/*'], flatten: true, dest: 'build/icons/', filter: 'isFile'},
					{expand: true, src: ['src/images/*'], flatten: true, dest: 'build/images/', filter: 'isFile'}
				],
			},
			js: {
				files: [
					{expand: true, src: [
						'bower_components/jquery/dist/jquery.min.js',
						'bower_components/respond/dest/respond.min.js',
						'bower_components/modernizr/modernizr.js'
					], flatten: true, dest: 'build/js/core/', filter: 'isFile'}
				],
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
	grunt.loadNpmTasks('grunt-contrib-copy');

  // Register tasks.
	grunt.registerTask('html', ['concat:pages','compile-handlebars']);
	grunt.registerTask('css', ['sass','autoprefixer','csscomb','cssmin']);
	grunt.registerTask('js', ['concat:bootstrapjs','copy:js','uglify']);
  grunt.registerTask('default', ['clean','html','css','js','copy:main']);
};
