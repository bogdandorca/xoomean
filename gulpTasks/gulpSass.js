var gulp = require('gulp'),
    del = require('del'),
    sass = require('gulp-sass'),
    minifyCss = require('gulp-minify-css'),
    autoprefixer = require('gulp-autoprefixer'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    argv = require('yargs').argv,
    gulpIf = require('gulp-if');

// Environment
var styles = './public/styles';
var vendor = './public/vendor';

gulp.task('sass', function(){
    del([styles+'/global.css']);
    del([styles+'/global.min.css']);
    return gulp.src([vendor + '/**/*.css', '!'+vendor+'/**/*.min.css', styles+'/**/*.scss'])
        .pipe(sass())
        .pipe(sourcemaps.init())
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: true
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulpIf(argv.prod, minifyCss()))
        .pipe(gulpIf(argv.prod, concat('global.css'))) /// Change name to min
        .pipe(gulpIf(!argv.prod, concat('global.css')))
        .pipe(gulp.dest(styles+'/'));
});