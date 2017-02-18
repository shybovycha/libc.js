var gulp = require('gulp');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('build-es6', function () {
    return gulp.src('src/c.js')
        .pipe(babel({
            presets: ['babili']
        }))
        .pipe(rename('c.min.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('build-es5', function () {
    return gulp.src('src/c.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(uglify())
        .pipe(rename('c.min.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['build-es6']);
