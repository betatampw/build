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
			options: {
				separator: '\n',
			},
			pages: {
				files: pagesConcatObject
			}
		},
		'compile-handlebars': {
			anyArray: {
				files: compileHandlebarsAr,
				templateData: compileHandlebarsDataAr
			}
		}
	});

  // Load the plugin.
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-compile-handlebars');
  // Register tasks.
  grunt.registerTask('default', ['clean','concat','compile-handlebars']);
};
