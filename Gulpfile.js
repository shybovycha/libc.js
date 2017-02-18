var gulp = require('gulp');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('default', function () {
    return gulp.src('src/c.js')
        .pipe(babel({
            presets: ['babili']
        }))
        .pipe(rename('c.min.js'))
        .pipe(gulp.dest('dist'));
});
