var
	config = require('../config'),
	gulp = require('gulp'),
	notification = require('../utils/notification'),
	paths = require('../utils/paths')('scripts'),
	task,

	concat = require('gulp-concat'),
	eslint = require('gulp-eslint'),
	include = require('gulp-include'),
	sourcemaps = require('gulp-sourcemaps'),
	summary = require('engage-eslint-summary'),
	uglify = require('gulp-uglify'),

	lintSummary = function(name) {
		return function() {
			return gulp
				.src(paths.scripts(name, true))
				.pipe(eslint())
				.pipe(eslint.format(summary))
				.pipe(
					eslint.failOnError()
						.on('error', notification({
							title: 'JavaScript Error',
							subtitle: [
								'<%= options.relative(options.cwd, error.fileName) %>',
								'<%= error.lineNumber %>',
							].join(':'),
							message: '<%= error.message %>',
							open: 'file://<%= error.fileName %>',
						}))
				)
				.pipe(eslint.failAfterError());
		};
	},

	lint = function(name) {
		return function() {
			return gulp
				.src(paths.scripts(name, true))
				.pipe(eslint())
				.pipe(eslint.format())
				.pipe(eslint.failAfterError());
		};
	},

	compile = function(name) {
		return function() {
			return gulp
				.src(paths.scripts(name))
				.pipe(sourcemaps.init())
				.pipe(concat(name + '.js'))
				.pipe(include({
					hardFail: true,
					includePaths: config.tasks.scripts.includePaths,
				}))
				.pipe(uglify())
				.pipe(sourcemaps.write('.'))
				.pipe(gulp.dest(paths.dest));
		};
	};

config.tasks.scripts.files.forEach(function(file) {
	var
		tasks = [],
		prefix = 'scripts.' + file.name;

	if (file.lint) {
		task = prefix + '.lint';
		tasks.push(task);
		gulp.task(task, lintSummary(file.name));
		gulp.task(task + '.full', lint(file.name));
	}

	task = prefix + '.compile';
	tasks.push(task);
	gulp.task(task, compile(file.name));

	gulp.task(prefix, gulp.series(tasks));
});

task = gulp.parallel(config.tasks.scripts.files.map(function(file) {
	return 'scripts.' + file.name;
}));
gulp.task('scripts', task);
module.exports = task;

gulp.task('scripts.lint', gulp.series('scripts.site.lint')); // legacy alias
gulp.task('scripts.lint.full', gulp.series('scripts.site.lint.full')); // legacy alias