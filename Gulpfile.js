var gulp = require('gulp');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var rollup = require('gulp-rollup');

gulp.task('es6', function () {
    return gulp.src('src/**/*.js')
        .pipe(rollup({
            entry: 'src/c.js',
            format: 'iife'
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('es6-min', ['es6'], function () {
    return gulp.src('dist/c.js')
        .pipe(babel({
            presets: ['babili']
        }))
        .pipe(rename('c.min.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('build-es6', ['es6', 'es6-min']);

gulp.task('es5', function () {
    return gulp.src('src/**/*.js')
        .pipe(rollup({
            entry: 'src/c.js',
            format: 'iife'
        }))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('es5-min', ['es5'], function () {
    return gulp.src('dist/c.js')
        .pipe(uglify())
        .pipe(rename('c.min.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('build-es5', ['es5', 'es5-min']);

gulp.task('default', ['build-es6']);
