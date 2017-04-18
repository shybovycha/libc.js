var gulp = require('gulp');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var rollup = require('gulp-rollup');
var rollupBabel = require('rollup-plugin-babel');
var removeEmptyLines = require('gulp-remove-empty-lines');

gulp.task('es6', function () {
    return gulp.src('src/**/*.js')
        .pipe(rollup({
            entry: 'src/libc.js',
            format: 'cjs',
            plugins: [
                rollupBabel({
                    presets: ['stage-2'],
                    plugins: ['remove-comments'],
                    babelrc: false
                })
            ]
        }))
        .pipe(removeEmptyLines({ removeComments: true }))
        .pipe(gulp.dest('dist'));
});

gulp.task('es6-min', ['es6'], function () {
    return gulp.src('dist/libc.js')
        .pipe(babel({
            presets: ['babili'],
            plugins: ['transform-object-rest-spread'],
            babelrc: false
        }))
        .pipe(rename('libc.min.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('build-es6', ['es6', 'es6-min']);

gulp.task('es5', function () {
    return gulp.src('src/**/*.js')
        .pipe(rollup({
            entry: 'src/libc.js',
            format: 'iife',
            plugins: [
                rollupBabel({
                    presets: [['es2015', { modules: false }]],
                    plugins: ['transform-object-rest-spread', 'external-helpers', 'remove-comments']
                })
            ]
        }))
        .pipe(removeEmptyLines({ removeComments: true }))
        .pipe(gulp.dest('dist'));
});

gulp.task('es5-min', ['es5'], function () {
    return gulp.src('dist/libc.js')
        .pipe(uglify())
        .pipe(rename('libc.min.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('build-es5', ['es5', 'es5-min']);

gulp.task('watch-es6', ['build-es6'], function () {
    gulp.watch(['src/**/*'], ['build-es6']);
});

gulp.task('watch-es5', ['build-es5'], function () {
    gulp.watch(['src/**/*'], ['build-es5']);
});

gulp.task('default', ['build-es6']);
gulp.task('watch', ['watch-es6']);
