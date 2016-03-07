var gulp = require('gulp'),
	rename = require('gulp-rename'),
	concat = require('gulp-concat'),
	lint = require('gulp-jshint'),
	uglify = require('gulp-uglify'),
	optim = require('gulp-imageoptim');

gulp.task('process-images', function() {
	return gulp.src('images/*')
		.pipe(optim.optimize())
		.pipe(gulp.dest('build/images'))
});
gulp.task('process-scripts', function() {
	return gulp.src(['./js/resources.js','./js/config.json','./js/app.js','./js/engine.js'])
		.pipe(lint())
		.pipe(lint.reporter())
		.pipe(concat('main.js'))
		.pipe(rename({suffix: '.min'}))
		.pipe(uglify())
		.pipe(gulp.dest('build/js'));
});

gulp.task('default', ['process-images', 'process-scripts'], function() {});